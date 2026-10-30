export interface Inmueble {
  id: string
  tipo: string
  ciudad: string
  precio: number
  imagen: string
}

export const MAX_DESTACADOS = 5
export const IMAGEN_POR_DEFECTO = "/img/img1.webp"

export const CLASES = {
  tarjeta:
    "inmueble-card group relative w-full max-w-[190px] mx-auto aspect-[270/383] min-w-0 rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.30)] border border-black/10 bg-gray-200",
  enlace: "block w-full h-full relative",
  imagen:
    "absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105",
  etiqueta:
    "absolute top-2.5 left-2.5 z-10 bg-[#707982] text-white text-sm font-bold tracking-wide px-3 py-1.5 rounded-md leading-tight",
  panel:
    "absolute bottom-[5%] inset-x-0 z-10 bg-[rgba(90,90,90,0.58)] py-2 text-center text-white",
  precio:
    "text-lg sm:text-xl md:text-2xl font-normal tracking-wide leading-tight",
  ciudad:
    "text-base sm:text-lg md:text-xl font-normal tracking-wide uppercase mt-1 leading-tight",
  skeleton:
    "w-full max-w-[190px] mx-auto aspect-[270/383] rounded-xl bg-gray-200 animate-pulse",
} as const

type Crudo = Record<string, unknown>

const esObjeto = (v: unknown): v is Crudo =>
  typeof v === "object" && v !== null && !Array.isArray(v)

function leerTexto(raw: Crudo, claves: string[]): string {
  for (const clave of claves) {
    const v = raw[clave]
    if (typeof v === "string" && v.trim()) return v.trim()
    if (typeof v === "number" && Number.isFinite(v)) return String(v)
  }
  return ""
}

function aNumero(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  if (typeof v !== "string") return 0
  const entero = v
    .trim()
    .replace(/[.,]\d{1,2}$/, "")
    .replace(/\D/g, "")
  return entero ? Number(entero) : 0
}

function precioDe(raw: Crudo): number {
  for (const clave of [
    "Canon",
    "canon",
    "Venta",
    "venta",
    "Precio",
    "precio",
  ]) {
    const n = aNumero(raw[clave])
    if (n > 0) return n
  }
  return 0
}

function urlImagen(valor: string): string {
  if (!valor) return IMAGEN_POR_DEFECTO
  if (valor.startsWith("//")) return `https:${valor}`
  if (valor.startsWith("/")) return valor
  if (/^https:\/\//i.test(valor)) return valor
  if (/^http:\/\//i.test(valor)) return valor.replace(/^http:/i, "https:")
  return IMAGEN_POR_DEFECTO
}

function normalizar(raw: Crudo): Inmueble | null {
  const id = leerTexto(raw, ["Codigo_Inmueble", "codigo", "Codigo", "id"])
  if (!id) return null

  return {
    id,
    tipo:
      leerTexto(raw, ["Tipo_Inmueble", "tipoInmueble", "tipo"]) || "Inmueble",
    ciudad: leerTexto(raw, ["Ciudad", "ciudad"]).toUpperCase(),
    precio: precioDe(raw),
    imagen: urlImagen(leerTexto(raw, ["foto1", "foto", "imagen"])),
  }
}

export function extraerLista(datos: unknown): Crudo[] {
  let lista: unknown[] = []
  if (Array.isArray(datos)) {
    lista = datos
  } else if (esObjeto(datos)) {
    const valores = Object.values(datos)
    const interno = valores.find(Array.isArray)
    lista = Array.isArray(interno) ? interno : valores
  }
  return lista.filter(esObjeto)
}

export function normalizarLista(datos: unknown): Inmueble[] {
  return extraerLista(datos)
    .map(normalizar)
    .filter((i): i is Inmueble => i !== null)
    .slice(0, MAX_DESTACADOS)
}

export function firmaLista(lista: Inmueble[]): string {
  return lista.map((i) => `${i.id}|${i.precio}|${i.imagen}`).join(";")
}

export function formatearPrecio(precio: number): string {
  return precio > 0 ? `$ ${precio.toLocaleString("es-CO")}` : "Consultar"
}

export function etiquetaInmueble(i: Inmueble): string {
  return i.ciudad ? `${i.tipo} en ${i.ciudad}` : i.tipo
}
