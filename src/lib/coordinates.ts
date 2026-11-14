import { toNumber } from "./propertyCatalog"
import type { Property } from "./propertyCatalog"

export const CITY_COORDINATES: Record<string, [number, number]> = {
  medellin: [6.2442, -75.5812],
  medellín: [6.2442, -75.5812],
  envigado: [6.167, -75.584],
  sabaneta: [6.1517, -75.6156],
  bello: [6.3373, -75.5579],
  itagui: [6.1846, -75.5991],
  itagüí: [6.1846, -75.5991],
  laestrella: [6.1578, -75.6432],
  "la estrella": [6.1578, -75.6432],
  rionegro: [6.154, -75.374],
  bogota: [4.711, -74.0721],
  bogotá: [4.711, -74.0721],
  "distrito capital": [4.711, -74.0721],
  guarne: [6.2801, -75.4428],
  laceja: [6.0315, -75.4312],
  "la ceja": [6.0315, -75.4312],
  marinilla: [6.1747, -75.3341],
  sopetran: [6.5005, -75.7441],
  caldas: [6.0938, -75.6373],
  girardota: [6.3791, -75.4461],
  copacabana: [6.3488, -75.5109],
  barbosa: [6.4367, -75.3312],
  "el retiro": [6.0589, -75.5133],
  retiro: [6.0589, -75.5133],
  "la union": [5.9774, -75.3589],
  carmen: [6.0391, -75.1365],
  "el peñol": [6.2126, -75.2374],
  peñol: [6.2126, -75.2374],
  granada: [6.1491, -75.1909],
  santuario: [6.1397, -75.2731],
  "puerto berrio": [6.4906, -74.3983],
  turbo: [8.0944, -76.7227],
  apartado: [7.8803, -76.6273],
  cali: [3.4516, -76.5319],
  barranquilla: [10.9685, -74.7813],
  cartagena: [10.391, -75.4794],
  bucaramanga: [7.1198, -73.1227],
  manizales: [5.0703, -75.5138],
  pereira: [4.8133, -75.6961],
  armenia: [4.5339, -75.6811],
  cucuta: [7.8939, -72.5078],
  villavicencio: [4.142, -73.6266],
  monteria: [8.7575, -75.8853],
  pasto: [1.2136, -77.2811],
  neiva: [2.9273, -75.282],
  ibague: [4.4389, -75.2322],
}

export const BARRIO_COORDINATES: Record<string, [number, number]> = {
  // Medellín
  laureles: [6.244, -75.593],
  poblado: [6.208, -75.568],
  "el poblado": [6.208, -75.568],
  belen: [6.23, -75.599],
  belén: [6.23, -75.599],
  "los colores": [6.261, -75.594],
  colores: [6.261, -75.594],
  estadio: [6.255, -75.588],
  floresta: [6.259, -75.599],
  conquistadores: [6.241, -75.583],
  robledo: [6.274, -75.593],
  "san german": [6.269, -75.591],
  "otra parte": [6.178, -75.5888],
  "el esmeraldal": [6.172, -75.578],
  esmeraldal: [6.172, -75.578],
  primavera: [6.1636, -75.6037],
  suramerica: [6.1618, -75.6305],
  suramérica: [6.1618, -75.6305],
  cumbres: [6.169, -75.575],
  ditaires: [6.175, -75.608],
  "san joaquin": [6.245, -75.591],
  aranjuez: [6.279, -75.561],
  manrique: [6.277, -75.556],
  castilla: [6.284, -75.579],
  "doce de octubre": [6.291, -75.573],
  "doce octubre": [6.291, -75.573],
  "san javier": [6.258, -75.597],
  "villa hermosa": [6.249, -75.554],
  villaher: [6.249, -75.554],
  "buenos aires": [6.237, -75.555],
  guayabal: [6.218, -75.579],
  "la america": [6.252, -75.595],
  "la candelaria": [6.252, -75.569],
  "santa lucia": [6.219, -75.584],
  "el centro": [6.252, -75.569],
  centro: [6.252, -75.569],
  // Bogotá barrios principales
  chapinero: [4.6473, -74.0632],
  usaquen: [4.701, -74.031],
  usaquén: [4.701, -74.031],
  suba: [4.7414, -74.0856],
  kennedy: [4.6256, -74.1534],
  bosa: [4.6186, -74.1879],
  engativa: [4.7013, -74.1181],
  engativá: [4.7013, -74.1181],
  fontibon: [4.6719, -74.1472],
  fontibón: [4.6719, -74.1472],
  puente: [4.6693, -74.1012],
  tunjuelito: [4.5946, -74.1222],
  "san cristobal": [4.5779, -74.0831],
  rafael: [4.6761, -74.0515],
  teusaquillo: [4.6512, -74.0923],
  barrios: [4.6338, -74.0617],
  "ciudad bolivar": [4.5375, -74.1467],
  usme: [4.5057, -74.1065],
  "santa fe": [4.5955, -74.0789],
  candelaria: [4.5962, -74.0745],
  martires: [4.6181, -74.0822],
  mártires: [4.6181, -74.0822],
  antonio: [4.5873, -74.1253],
  nariño: [4.5852, -74.0983],
}

export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

/**
 * Calcula o resuelve lat/lng para un inmueble. Si no tiene GPS real,
 * busca por barrio/ciudad y aplica un pequeño offset de dispersión.
 */
export function resolvePropertyCoordinates(property: Property): {
  lat: number
  lng: number
  isRealGps: boolean
} {
  let lat = property.latitude || 0
  let lng = property.longitude || 0

  const isRealGps = lat > 1 && lat < 13 && lng < -66 && lng > -82

  if (!isRealGps) {
    const cleanBarrio = normalizeText(property.neighborhood || "")
    const cleanCity = normalizeText(property.city || "")

    const barrioCoord = Object.entries(BARRIO_COORDINATES).find(
      ([k]) =>
        cleanBarrio &&
        (cleanBarrio === k ||
          cleanBarrio.includes(k) ||
          k.includes(cleanBarrio)),
    )
    const cityCoord = Object.entries(CITY_COORDINATES).find(
      ([k]) =>
        cleanCity &&
        (cleanCity === k || cleanCity.includes(k) || k.includes(cleanCity)),
    )

    const isBogota =
      cleanCity.includes("bogot") || cleanCity.includes("distrito")
    const defaultCenter: [number, number] = isBogota
      ? [4.711, -74.0721]
      : [6.2442, -75.5812]

    const base: [number, number] = barrioCoord
      ? barrioCoord[1]
      : cityCoord
        ? cityCoord[1]
        : defaultCenter

    const num = toNumber(property.code) || 1
    lat = base[0] + ((num % 23) - 11) * 0.0028
    lng = base[1] + ((num % 29) - 14) * 0.0028
  }

  return { lat, lng, isRealGps }
}
