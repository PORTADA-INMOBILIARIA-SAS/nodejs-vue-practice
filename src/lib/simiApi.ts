import { toNumber } from "./propertyCatalog"
import type { Mode, Property } from "./propertyCatalog"

const SIMI_BASE =
  "https://api-crinmo.azurewebsites.net/simi/v2.1.1/filtroInmueble"
const OPERATION_ID: Record<Mode, number> = { rent: 1, sale: 5 }
const MAX_PRICE: Record<Mode, number> = {
  rent: 200_000_000,
  sale: 4_000_000_000,
}

export interface SimiQueryParams {
  mode: Mode
  page?: number
  perPage?: number
  cityId?: number
  barrioId?: number
  typeId?: number
  maxPrice?: number
  minPrice?: number
  bedrooms?: number
  campo?: string
  precio?: string
  order?: string
}

export interface SimiResult {
  items: Property[]
  totalItems: number
  totalPages: number
}

function normalizeRaw(raw: Record<string, any>, m: Mode): Property {
  const rawCode = String(raw.Codigo_Inmueble || raw.codinm || raw.idInm || "")
  const code = rawCode && !rawCode.includes("-") ? `679-${rawCode}` : rawCode
  const gestion = String(
    raw.Gestion || raw.gestion || raw.operacion || raw.tipoOperacion || "",
  ).toLowerCase()
  const detectedMode: Mode =
    gestion.includes("venta") ||
    (toNumber(raw.Venta) > 0 && !toNumber(raw.Canon))
      ? "sale"
      : gestion.includes("arriendo") || toNumber(raw.Canon) > 0
        ? "rent"
        : m
  return {
    code,
    mode: detectedMode,
    type: String(raw.Tipo_Inmueble || raw.tpinmu || ""),
    city: String(raw.Ciudad || raw.nciudad || ""),
    neighborhood: String(raw.Barrio || raw.NombreB || ""),
    zone: String(raw.Zona || ""),
    bedrooms: toNumber(raw.Alcobas || raw.alcobas),
    bathrooms: toNumber(raw.banios || raw.banos),
    parking: toNumber(raw.garaje),
    area: Number(raw.AreaConstruida || raw.areaConstruida) || 0,
    stratum: toNumber(raw.Estrato || raw.estrato),
    price:
      toNumber(raw.valorFiltro) ||
      toNumber(raw.Venta) ||
      toNumber(raw.Canon) ||
      toNumber(raw.ValorCanon) ||
      toNumber(raw.ValorVenta) ||
      toNumber(raw.precio),
    photo: String(
      raw.foto1 || (Array.isArray(raw.fotos) && raw.fotos[0]?.foto) || "",
    ),
    description: String(raw.descripcionlarga || raw.descrip || ""),
    date: String(raw.fingreso || ""),
    featured: String(raw.destacado) === "1",
    furnished: Number(raw.amoblado) === 1 || raw.amobladoInmueble === true,
    adminIncluded: String(raw.admonIncluida) === "1",
    latitude: Number(raw.latitud ?? raw.latitude) || 0,
    longitude: Number(raw.longitud ?? raw.longitude) || 0,
  }
}

// Persistent module-level cache
const cache = new Map<string, { time: number; data: SimiResult }>()
const inflight = new Map<string, Promise<SimiResult>>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

const codeCache = new Map<string, { time: number; data: Property | null }>()

function buildCacheKey(params: SimiQueryParams): string {
  return [
    params.mode,
    params.page || 1,
    params.perPage || 12,
    params.cityId || 0,
    params.barrioId || 0,
    params.typeId || 0,
    params.maxPrice || 0,
    params.minPrice || 0,
    params.bedrooms || 0,
    params.campo || "fecha",
    params.precio || "0",
    params.order || "desc",
  ].join(":")
}

export async function fetchSimiPropertiesCached(
  params: SimiQueryParams,
): Promise<SimiResult> {
  const key = buildCacheKey(params)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data
  }

  const existingInflight = inflight.get(key)
  if (existingInflight) {
    return existingInflight
  }

  const opId = OPERATION_ID[params.mode]
  const page = Math.max(1, params.page || 1)
  const perPage = params.perPage || 12
  const cityId = params.cityId || 0
  const barrioId = params.barrioId || 0
  const typeId = params.typeId || 0
  const minPrice = params.minPrice || 0
  const maxPrice =
    params.maxPrice && params.maxPrice > 0
      ? params.maxPrice
      : MAX_PRICE[params.mode]
  const alcobas = params.bedrooms && params.bedrooms > 0 ? params.bedrooms : 0
  const campo = params.campo || "fecha"
  const precio = params.precio !== undefined ? params.precio : "0"
  const order = params.order || "desc"

  const path = [
    "limite",
    page,
    "total",
    perPage,
    "ciudad",
    cityId,
    "barrio",
    barrioId,
    "tipoInm",
    typeId,
    "tipOper",
    opId,
    "valmin",
    minPrice,
    "valmax",
    maxPrice,
    "campo",
    campo,
    "precio",
    precio,
    "order",
    order,
    "banios",
    0,
    "alcobas",
    alcobas,
    "garajes",
    0,
    "sede",
    0,
    "usuario",
    0,
  ].join("/")

  const promise = (async () => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 20_000)
    try {
      const res = await fetch(`${SIMI_BASE}/${path}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      let data: any = null
      try {
        data = JSON.parse(text)
      } catch {
        return { items: [], totalItems: 0, totalPages: 1 }
      }

      if (!data || typeof data !== "object") {
        return { items: [], totalItems: 0, totalPages: 1 }
      }

      const rawList: Record<string, any>[] = Array.isArray(data.Inmuebles)
        ? data.Inmuebles
        : []
      const totalItems =
        toNumber(data.datosGrales?.totalInmuebles) || rawList.length
      const totalPages =
        toNumber(data.datosGrales?.fin) ||
        Math.max(1, Math.ceil(totalItems / perPage))

      const result: SimiResult = {
        items: rawList.map((r) => normalizeRaw(r, params.mode)),
        totalItems,
        totalPages,
      }

      cache.set(key, { time: Date.now(), data: result })
      return result
    } finally {
      clearTimeout(timer)
      inflight.delete(key)
    }
  })()

  inflight.set(key, promise)
  return promise
}

export async function fetchPropertyByCodeCached(
  codeQuery: string,
  m: Mode,
): Promise<Property | null> {
  const clean = codeQuery.trim()
  if (!clean) return null
  const codeToTry = clean.startsWith("679-") ? clean : `679-${clean}`
  const key = `${codeToTry}:${m}`
  const cached = codeCache.get(key) || codeCache.get(codeToTry)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data
  }

  const inDetail = detailCache.get(codeToTry) || detailCache.get(clean)
  if (inDetail && inDetail.data) {
    const prop = normalizeRaw(inDetail.data, m)
    codeCache.set(key, { time: Date.now(), data: prop })
    codeCache.set(codeToTry, { time: Date.now(), data: prop })
    return prop
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8_000)
  try {
    const res = await fetch(
      `https://api-crinmo.azurewebsites.net/simi/v2/inmueble/codInmueble/${encodeURIComponent(codeToTry)}`,
      { signal: controller.signal },
    )
    if (!res.ok) return null
    const data = await res.json()
    const raw = Array.isArray(data)
      ? data[0]
      : data?.Inmueble || data?.inmueble || data
    const item = Array.isArray(raw) ? raw[0] : raw
    if (
      item &&
      (item.Codigo_Inmueble ||
        item.codinm ||
        item.idInm ||
        item.idInmueble ||
        item.tpinmu ||
        item.Tipo_Inmueble)
    ) {
      const prop = normalizeRaw(item, m)
      codeCache.set(key, { time: Date.now(), data: prop })
      return prop
    }
  } catch {
  } finally {
    clearTimeout(timer)
  }
  return null
}

const detailCache = new Map<string, { time: number; data: any }>()
const inflightDetail = new Map<string, Promise<any>>()

export async function fetchPropertyDetailCached(id: string): Promise<any> {
  const cleanId = (id || "").trim()
  if (!cleanId) return null
  const codeToTry = cleanId.startsWith("679-") ? cleanId : `679-${cleanId}`

  const cached = detailCache.get(codeToTry) || detailCache.get(cleanId)
  if (
    cached &&
    Date.now() - cached.time < CACHE_TTL &&
    Array.isArray(cached.data?.fotos) &&
    cached.data.fotos.length > 0
  ) {
    return cached.data
  }

  const existingInflight = inflightDetail.get(codeToTry)
  if (existingInflight) {
    return existingInflight
  }

  const promise = (async () => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 12_000)
    try {
      const resDetalle = await fetch(
        `https://api-crinmo.azurewebsites.net/simi/v2/inmueble/codInmueble/${encodeURIComponent(codeToTry)}`,
        { signal: controller.signal },
      )
      if (resDetalle.ok) {
        const data = await resDetalle.json()
        const detalle = Array.isArray(data)
          ? data[0]
          : data?.Inmueble || data?.inmueble || data?.data || data
        const item = Array.isArray(detalle) ? detalle[0] : detalle
        if (item) {
          detailCache.set(codeToTry, { time: Date.now(), data: item })
          detailCache.set(cleanId, { time: Date.now(), data: item })
          return item
        }
      }
    } catch {
      return null
    } finally {
      clearTimeout(timer)
      inflightDetail.delete(codeToTry)
    }
    return null
  })()

  inflightDetail.set(codeToTry, promise)
  return promise
}

// Background prewarm default views
fetchSimiPropertiesCached({ mode: "rent", page: 1, perPage: 12 }).catch(
  () => {},
)
fetchSimiPropertiesCached({ mode: "sale", page: 1, perPage: 12 }).catch(
  () => {},
)
