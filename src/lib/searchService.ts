import { toNumber } from "./propertyCatalog"
import type { Mode, Property } from "./propertyCatalog"
import { resolveLocation, resolvePropertyTypeId } from "./simiLocations"
import {
  fetchSimiPropertiesCached as fetchSimiProperties,
  fetchPropertyByCodeCached as fetchPropertyByCode,
} from "./simiApi"
import { normalizeText, resolvePropertyCoordinates } from "./coordinates"

export const PAGE_SIZE = 12

export const PROPERTY_TYPES = [
  "Apartamento",
  "Casa",
  "Apartaestudio",
  "Local",
  "Oficina",
  "Consultorio",
  "Bodega",
  "Lote",
  "Finca",
  "Edificio",
]

export const PLACES = [
  "Medellín",
  "Laureles, Medellín",
  "El Poblado, Medellín",
  "Los Colores, Medellín",
  "Belén, Medellín",
  "Bello",
  "Envigado",
  "Sabaneta",
  "La Estrella",
  "Rionegro",
  "Itagüí",
  "Bogotá",
]

export const BEDROOM_OPTIONS = [
  { value: "", label: "Cualquiera" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
]

export const FEATURE_OPTIONS = [
  { value: "", label: "Todas las características" },
  { value: "balcon", label: "Balcón" },
  { value: "ascensor", label: "Ascensor" },
  { value: "mascotas", label: "Mascotas" },
  { value: "piscina", label: "Piscina" },
  { value: "jardin", label: "Jardín" },
]

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recomendados" },
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
]

const currency = new Intl.NumberFormat("es-CO")

const sortWithPhotosFirst = (list: Property[]) =>
  [...list].sort((a, b) => {
    const aHas = a.photo ? 1 : 0
    const bHas = b.photo ? 1 : 0
    return bHas - aHas
  })

export async function getSearchResults(query: URLSearchParams) {
  const read = (name: string, legacyName: string) =>
    query.get(name) ?? query.get(legacyName) ?? ""

  const rawMode = read("mode", "modalidad")
  const mode: Mode = rawMode === "sale" || rawMode === "venta" ? "sale" : "rent"
  const city = read("city", "ciudad").trim()
  const propertyType = read("type", "tipo").trim()
  const budget = toNumber(read("budget", "presupuesto"))
  const code = read("code", "codigo").trim()
  const bedrooms = Math.min(9, toNumber(query.get("bedrooms")))
  const feature = query.get("feature") ?? ""
  const sort = query.get("sort") ?? "recommended"
  const favoriteCodes = (query.get("favorites") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
  const requestedPage = Math.max(1, toNumber(query.get("page")) || 1)

  const apiOrder =
    sort === "price_asc"
      ? { campo: "precio", order: "asc", precio: "1" }
      : sort === "price_desc"
        ? { campo: "precio", order: "desc", precio: "1" }
        : { campo: "fecha", order: "desc", precio: "0" }

  let visible: Property[] = []
  let total = 0
  let totalPages = 1
  let currentPage = requestedPage
  let loadFailed = false

  try {
    if (favoriteCodes.length > 0) {
      const validCodes = favoriteCodes.filter((c) => c && c !== "all")
      if (validCodes.length > 0) {
        const fetched = await Promise.all(
          validCodes.map((c) => fetchPropertyByCode(c, mode)),
        )
        const all = fetched.filter((p): p is Property => Boolean(p))
        total = all.length
        totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
        currentPage = Math.min(requestedPage, totalPages)
        visible = sortWithPhotosFirst(
          all.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        )
      }
    } else if (code) {
      const found = await fetchPropertyByCode(code, mode)
      if (found) {
        visible = [found]
        total = 1
      }
    } else {
      const loc = resolveLocation(city)
      const typeId = resolvePropertyTypeId(propertyType)
      const hasUnresolvedText = Boolean(city && loc.cityId === 0)
      const hasFeature = Boolean(feature)

      if (!hasUnresolvedText && !hasFeature) {
        const result = await fetchSimiProperties({
          mode,
          page: requestedPage,
          perPage: PAGE_SIZE,
          cityId: loc.cityId,
          barrioId: loc.barrioId,
          typeId,
          maxPrice: budget > 0 ? budget : 0,
          bedrooms,
          campo: apiOrder.campo,
          precio: apiOrder.precio,
          order: apiOrder.order,
        })

        visible = sortWithPhotosFirst(result.items)
        total = result.totalItems
        totalPages = result.totalPages
        currentPage = requestedPage
      } else {
        const result = await fetchSimiProperties({
          mode,
          page: 1,
          perPage: 100,
          cityId: loc.cityId,
          barrioId: loc.barrioId,
          typeId,
          maxPrice: budget > 0 ? budget : 0,
          bedrooms,
        })

        const placeTerms = normalizeText(city)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)

        const filtered = result.items.filter((p) => {
          if (hasUnresolvedText) {
            const place = normalizeText(`${p.neighborhood} ${p.city} ${p.zone}`)
            if (placeTerms.some((t) => !place.includes(t))) return false
          }
          if (
            propertyType &&
            normalizeText(p.type) !== normalizeText(propertyType)
          )
            return false
          if (budget > 0 && p.price > budget) return false
          if (feature) {
            const desc = normalizeText(`${p.description} ${p.type}`)
            if (feature === "balcon" && !desc.includes("balcon")) return false
            if (feature === "ascensor" && !desc.includes("ascensor"))
              return false
            if (
              feature === "mascotas" &&
              !desc.includes("mascota") &&
              !desc.includes("pet")
            )
              return false
            if (
              feature === "piscina" &&
              !desc.includes("piscina") &&
              !desc.includes("alberca")
            )
              return false
            if (
              feature === "jardin" &&
              !desc.includes("jardin") &&
              !desc.includes("patio") &&
              !desc.includes("zonas verdes")
            )
              return false
            if (feature === "furnished" && !p.furnished) return false
            if (feature === "admin" && !p.adminIncluded) return false
            if (feature === "featured" && !p.featured) return false
          }
          return true
        })

        total = filtered.length
        totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
        currentPage = Math.min(requestedPage, totalPages)
        visible = sortWithPhotosFirst(
          filtered.slice(
            (currentPage - 1) * PAGE_SIZE,
            currentPage * PAGE_SIZE,
          ),
        )
      }
    }
  } catch (e) {
    console.error("Error al cargar inmuebles:", e)
    loadFailed = true
  }

  // Carga para los mapas
  let allItemsForMap: Property[] = visible
  try {
    if (!favoriteCodes.length && !code) {
      const loc = resolveLocation(city)
      const typeId = resolvePropertyTypeId(propertyType)
      const hasUnresolvedText = Boolean(city && loc.cityId === 0)

      async function fetchAllPagesForCity(cityId: number): Promise<Property[]> {
        const baseParams = {
          mode,
          page: 1,
          perPage: 100,
          cityId,
          barrioId: cityId === loc.cityId ? loc.barrioId : 0,
          typeId,
          maxPrice: budget > 0 ? budget : 0,
          bedrooms,
          campo: apiOrder.campo,
          precio: apiOrder.precio,
          order: apiOrder.order,
        }
        const first = await fetchSimiProperties(baseParams)
        if (!first || first.items.length === 0) return []

        let items = [...first.items]
        const pages = Math.min(first.totalPages, 10)

        if (pages > 1) {
          const extraPages = Array.from({ length: pages - 1 }, (_, i) => i + 2)
          const extras = await Promise.allSettled(
            extraPages.map((pg) =>
              fetchSimiProperties({ ...baseParams, page: pg }),
            ),
          )
          for (const r of extras) {
            if (r.status === "fulfilled" && r.value.items.length > 0) {
              items = items.concat(r.value.items)
            }
          }
        }
        return items
      }

      const cityResults = await Promise.allSettled([
        fetchAllPagesForCity(loc.cityId),
      ])
      let allItems: Property[] = []
      for (const r of cityResults) {
        if (r.status === "fulfilled") {
          allItems = allItems.concat(r.value)
        }
      }

      const seen = new Set<string>()
      allItems = allItems.filter((p) => {
        if (seen.has(p.code)) return false
        seen.add(p.code)
        return true
      })

      if (allItems.length > 0) {
        if (hasUnresolvedText || propertyType || budget > 0 || feature) {
          const placeTerms = normalizeText(city)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)

          allItemsForMap = allItems.filter((p) => {
            if (hasUnresolvedText) {
              const place = normalizeText(
                `${p.neighborhood} ${p.city} ${p.zone}`,
              )
              if (placeTerms.some((t) => !place.includes(t))) return false
            }
            if (
              propertyType &&
              normalizeText(p.type) !== normalizeText(propertyType)
            )
              return false
            if (budget > 0 && p.price > budget) return false
            return true
          })
        } else {
          allItemsForMap = allItems
        }
      }
    }
  } catch {
    allItemsForMap = visible
  }

  if (allItemsForMap.length === 0 && visible.length > 0) {
    allItemsForMap = visible
  }

  const propertiesForMap = allItemsForMap.map((p) => {
    const { lat, lng, isRealGps } = resolvePropertyCoordinates(p)
    return {
      code: p.code,
      price: p.price,
      formattedPrice: `$ ${currency.format(p.price)}`,
      type: p.type,
      city: p.city,
      neighborhood: p.neighborhood,
      photo: p.photo ? p.photo.replace(/=s\d+$/, "=s640") : "",
      lat,
      lng,
      isRealGps,
      mode: p.mode,
    }
  })

  const countLabel =
    favoriteCodes.length > 0
      ? total === 1
        ? "favorito"
        : "favoritos"
      : total === 1
        ? "inmueble"
        : "inmuebles"

  return {
    mode,
    city,
    propertyType,
    budget,
    code,
    bedrooms,
    feature,
    sort,
    favoriteCodes,
    requestedPage,
    visible,
    total,
    totalPages,
    currentPage,
    loadFailed,
    allItemsForMap,
    propertiesForMap,
    countLabel,
  }
}
