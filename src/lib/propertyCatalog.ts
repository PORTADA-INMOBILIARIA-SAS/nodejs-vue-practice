const BASE_URL =
  "https://api-crinmo.azurewebsites.net/simi/v2.1.1/filtroInmueble"
const CACHE_TTL = 10 * 60 * 1000
const OPERATION_IDS: Record<string, number> = { rent: 1, sale: 5 }
const MAX_PRICE: Record<string, number> = { rent: 200000000, sale: 4000000000 }

export type Mode = "rent" | "sale"

export type Property = {
  code: string
  mode: Mode
  type: string
  city: string
  neighborhood: string
  zone: string
  bedrooms: number
  bathrooms: number
  parking: number
  area: number
  stratum: number
  price: number
  photo: string
  description: string
  date: string
  featured: boolean
  furnished: boolean
  adminIncluded: boolean
  latitude?: number
  longitude?: number
}

type RawProperty = Record<string, any>

export const toNumber = (value: unknown) =>
  Number(String(value ?? "").replace(/\D/g, "")) || 0

const normalizeProperty = (raw: RawProperty, mode: Mode): Property => ({
  code: String(raw.Codigo_Inmueble ?? ""),
  mode,
  type: String(raw.Tipo_Inmueble ?? ""),
  city: String(raw.Ciudad ?? ""),
  neighborhood: String(raw.Barrio ?? ""),
  zone: String(raw.Zona ?? ""),
  bedrooms: toNumber(raw.Alcobas),
  bathrooms: toNumber(raw.banios),
  parking: toNumber(raw.garaje),
  area: Number(raw.AreaConstruida) || 0,
  stratum: toNumber(raw.Estrato),
  price:
    toNumber(raw.valorFiltro) || toNumber(raw.Venta) || toNumber(raw.Canon),
  photo: String(raw.foto1 ?? ""),
  description: String(raw.descripcionlarga ?? ""),
  date: String(raw.fingreso ?? ""),
  featured: String(raw.destacado) === "1",
  furnished: Number(raw.amoblado) === 1 || raw.amobladoInmueble === true,
  adminIncluded: String(raw.admonIncluida) === "1",
})

const fetchPage = async (
  operationId: number,
  maxPrice: number,
  page: number,
  pageSize: number,
): Promise<RawProperty> => {
  const path = [
    "limite",
    page,
    "total",
    pageSize,
    "ciudad",
    0,
    "barrio",
    0,
    "tipoInm",
    0,
    "tipOper",
    operationId,
    "valmin",
    0,
    "valmax",
    maxPrice,
    "campo",
    "fecha",
    "precio",
    0,
    "order",
    "desc",
    "banios",
    0,
    "alcobas",
    0,
    "garajes",
    0,
    "sede",
    0,
    "usuario",
    0,
  ].join("/")

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25000)
  try {
    const response = await fetch(`${BASE_URL}/${path}`, {
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()) as RawProperty
  } finally {
    clearTimeout(timer)
  }
}

const loadAll = async (mode: Mode): Promise<Property[]> => {
  const operationId = OPERATION_IDS[mode]
  const maxPrice = MAX_PRICE[mode]

  let pageSize = 100
  let first: RawProperty
  try {
    first = await fetchPage(operationId, maxPrice, 1, pageSize)
  } catch {
    pageSize = 12
    first = await fetchPage(operationId, maxPrice, 1, pageSize)
  }

  const totalPages = Math.min(toNumber(first.datosGrales?.fin) || 1, 150)
  const rawList: RawProperty[] = Array.isArray(first.Inmuebles)
    ? [...first.Inmuebles]
    : []
  const pending = Array.from(
    { length: Math.max(0, totalPages - 1) },
    (_, index) => index + 2,
  )

  for (let start = 0; start < pending.length; start += 6) {
    const batch = await Promise.all(
      pending.slice(start, start + 6).map((page) =>
        fetchPage(operationId, maxPrice, page, pageSize)
          .then((data) => (Array.isArray(data.Inmuebles) ? data.Inmuebles : []))
          .catch(() => []),
      ),
    )
    batch.forEach((items) => rawList.push(...items))
  }

  const seen = new Set<string>()
  return rawList
    .map((raw) => normalizeProperty(raw, mode))
    .filter((property) => {
      if (!property.code || seen.has(property.code)) return false
      seen.add(property.code)
      return true
    })
}

const cache = new Map<Mode, { time: number; data: Promise<Property[]> }>()

export const getCatalog = (mode: Mode) => {
  const cached = cache.get(mode)
  if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data
  const data = loadAll(mode)
  data.catch(() => cache.delete(mode))
  cache.set(mode, { time: Date.now(), data })
  return data
}
