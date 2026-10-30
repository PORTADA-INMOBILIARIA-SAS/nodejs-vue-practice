import fs from "node:fs/promises"
import path from "node:path"

/* ---------------------------------------------------------------------------
 * Auditoría Lighthouse automatizada
 *
 * Uso:
 *   node scripts/lighthouse-audit.mjs
 *   node scripts/lighthouse-audit.mjs --url=http://localhost:4322
 *   node scripts/lighthouse-audit.mjs --properties=5
 *   node scripts/lighthouse-audit.mjs --paths=/,/search?mode=rent,/about
 *   node scripts/lighthouse-audit.mjs --min=90 --mobile
 *
 * Opciones:
 *   --url=<base>        URL base a auditar (por defecto http://localhost:4321)
 *   --paths=<a,b,c>     Rutas concretas a auditar
 *   --properties=<n>    Añade n fichas de inmueble reales (códigos desde la API)
 *   --categories=<a,b>  performance,accessibility,best-practices,seo
 *   --min=<0-100>       Falla (exit 1) si alguna categoría queda por debajo
 *   --mobile            Audita como móvil (por defecto escritorio)
 *   --out=<carpeta>     Carpeta de informes (por defecto reports/lighthouse)
 *   --chrome=<ruta>     Ruta al ejecutable de Chrome/Edge
 * ------------------------------------------------------------------------- */

const OPCIONES = analizarArgumentos(process.argv.slice(2))

const BASE = (
  OPCIONES.url ||
  process.env.AUDIT_URL ||
  "http://localhost:4321"
).replace(/\/+$/, "")
const SALIDA = path.resolve(OPCIONES.out || "reports/lighthouse")
const MINIMO = Number(OPCIONES.min || 0)
const ES_MOVIL = OPCIONES.mobile === true || OPCIONES.mobile === "true"
const CATEGORIAS = (
  OPCIONES.categories || "performance,accessibility,best-practices,seo"
)
  .split(",")
  .map((c) => c.trim())
  .filter(Boolean)

const API_INMUEBLES =
  "https://api-crinmo.azurewebsites.net/simi/v2.1.1/filtroInmueble/limite/1/total/{n}/ciudad/0/barrio/0/tipoInm/0/tipOper/0/valmin/0/valmax/0/campo/fecha/precio/0/order/desc/banios/0/alcobas/0/garajes/0/sede/0/usuario/0"

const RUTAS_POR_DEFECTO = [
  "/",
  "/search?mode=rent",
  "/search?mode=sale",
  "/about",
]

function analizarArgumentos(lista) {
  const opciones = {}
  for (const item of lista) {
    if (!item.startsWith("--")) continue
    const [clave, ...resto] = item.slice(2).split("=")
    opciones[clave] = resto.length > 0 ? resto.join("=") : true
  }
  return opciones
}

function color(puntaje) {
  if (puntaje === null || puntaje === undefined) return "\x1b[90m"
  if (puntaje >= 90) return "\x1b[32m"
  if (puntaje >= 50) return "\x1b[33m"
  return "\x1b[31m"
}

const RESET = "\x1b[0m"
const NEGRITA = "\x1b[1m"
const GRIS = "\x1b[90m"

async function existe(ruta) {
  try {
    await fs.access(ruta)
    return true
  } catch {
    return false
  }
}

async function encontrarNavegador() {
  const candidatos = [
    OPCIONES.chrome,
    process.env.CHROME_PATH,
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean)

  for (const candidato of candidatos) {
    if (await existe(candidato)) return candidato
  }
  return null
}

async function cargarDependencias() {
  try {
    const lighthouse = (await import("lighthouse")).default
    const chromeLauncher = await import("chrome-launcher")
    return { lighthouse, launch: chromeLauncher.launch }
  } catch {
    console.error(
      "\nFalta Lighthouse. Instálalo con:\n  npm install --save-dev lighthouse\n",
    )
    process.exit(1)
  }
}

async function codigosDeInmuebles(cantidad) {
  const url = API_INMUEBLES.replace("{n}", String(cantidad))
  try {
    const respuesta = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    })
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`)
    const datos = await respuesta.json()
    const lista = datos?.Inmuebles
      ? Object.values(datos.Inmuebles)
      : Array.isArray(datos)
        ? datos
        : []
    const codigos = lista
      .map(
        (item) =>
          item?.Codigo_Inmueble || item?.idInm || item?.idInmueble || "",
      )
      .filter(Boolean)
    return [...new Set(codigos)].slice(0, cantidad)
  } catch (error) {
    console.warn(
      `${GRIS}No se pudieron obtener inmuebles de la API (${error.message}). ` +
        `Se auditarán solo las rutas fijas.${RESET}`,
    )
    return []
  }
}

async function construirRutas() {
  const rutas = new Set()

  if (OPCIONES.paths && typeof OPCIONES.paths === "string") {
    for (const ruta of OPCIONES.paths.split(",")) {
      const limpia = ruta.trim()
      if (limpia) rutas.add(limpia)
    }
  }

  if (!OPCIONES.paths) {
    for (const ruta of RUTAS_POR_DEFECTO) rutas.add(ruta)
  }

  const cantidad = Number(OPCIONES.properties || 0)
  if (cantidad > 0) {
    const codigos = await codigosDeInmuebles(cantidad)
    for (const codigo of codigos) rutas.add(`/property/${codigo}`)
    if (codigos.length === 0) {
      console.warn(
        `${GRIS}Sin códigos de inmueble: usa --paths=/property/CODIGO${RESET}`,
      )
    }
  }

  return [...rutas]
}

function slug(ruta) {
  const limpia = ruta.split("?")[0].replace(/^\/+|\/+$/g, "")
  const base = limpia === "" ? "inicio" : limpia.replace(/[^a-zA-Z0-9]+/g, "-")
  return base.replace(/^-+|-+$/g, "").slice(0, 80)
}

function numero(valor, decimales = 0) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—"
  return Number(valor).toFixed(decimales)
}

function formatearMs(valor) {
  if (valor === null || valor === undefined) return "—"
  return `${Math.round(valor)} ms`
}

function celda(texto, ancho) {
  const visible = String(texto).replace(/\x1b\[[0-9;]*m/g, "")
  const relleno = " ".repeat(Math.max(0, ancho - visible.length))
  return `${texto}${relleno}`
}

async function calentar(url) {
  // En `astro dev` la primera visita compila la ruta: sin este paso
  // Lighthouse puede medir la compilación y marcar NO_FCP.
  try {
    await fetch(url, { signal: AbortSignal.timeout(120000) })
  } catch {
    // Si no responde, Lighthouse reportará el error real.
  }
}

async function auditar(url, contextos) {
  const { lighthouse, puerto } = contextos
  return lighthouse(
    url,
    {
      port: puerto,
      output: ["html", "json"],
      logLevel: "error",
      onlyCategories: CATEGORIAS,
      maxWaitForLoad: 90000,
      formFactor: ES_MOVIL ? "mobile" : "desktop",
      screenEmulation: ES_MOVIL
        ? {
            mobile: true,
            width: 412,
            height: 823,
            deviceScaleFactor: 2.6,
            disabled: false,
          }
        : {
            mobile: false,
            width: 1350,
            height: 940,
            deviceScaleFactor: 1,
            disabled: false,
          },
      throttlingMethod: "simulate",
      chromeFlags: [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
      ],
    },
    undefined,
  )
}

function extraerMetricas(json) {
  const auditorias = json.audits || {}
  const valor = (id) => auditorias[id]?.numericValue ?? null
  return {
    fcp: valor("first-contentful-paint"),
    lcp: valor("largest-contentful-paint"),
    tbt: valor("total-blocking-time"),
    cls: valor("cumulative-layout-shift"),
    si: valor("speed-index"),
  }
}

async function principal() {
  const { lighthouse, launch } = await cargarDependencias()

  const ejecutable = await encontrarNavegador()
  if (!ejecutable) {
    console.error(
      'No encontré Chrome ni Edge. Pasa la ruta con --chrome="C:\\ruta\\chrome.exe"',
    )
    process.exit(1)
  }

  const rutas = await construirRutas()
  if (rutas.length === 0) {
    console.error("No hay rutas para auditar.")
    process.exit(1)
  }

  await fs.mkdir(SALIDA, { recursive: true })

  console.log(`\n${NEGRITA}Auditoría Lighthouse${RESET}`)
  console.log(`${GRIS}Base:   ${BASE}`)
  console.log(`Salida: ${SALIDA}`)
  console.log(
    `Modo:   ${ES_MOVIL ? "móvil" : "escritorio"} · ${rutas.length} ruta(s)${RESET}\n`,
  )

  const navegador = await launch({
    chromePath: ejecutable,
    chromeFlags: [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  })

  const filas = []
  let fallos = 0

  try {
    for (const ruta of rutas) {
      const url = `${BASE}${ruta.startsWith("/") ? ruta : `/${ruta}`}`
      process.stdout.write(`${GRIS}→ ${url}${RESET}\n`)

      await calentar(url)

      let resultado
      try {
        resultado = await auditar(url, {
          lighthouse,
          puerto: navegador.port,
          navegador,
        })
      } catch (error) {
        console.error(`  ${color(0)}✗ Error: ${error.message}${RESET}\n`)
        fallos += 1
        filas.push({ ruta, puntajes: {}, metricas: {}, error: error.message })
        continue
      }

      const { lhr, report } = resultado.resultado
      const [html, json] = Array.isArray(report) ? report : [report, null]
      const nombre = `${slug(ruta)}-${ES_MOVIL ? "movil" : "escritorio"}`

      await fs.writeFile(path.join(SALIDA, `${nombre}.html`), html)
      if (json) await fs.writeFile(path.join(SALIDA, `${nombre}.json`), json)

      const puntajes = {}
      for (const [clave, categoria] of Object.entries(lhr.categories)) {
        const valor = Math.round(categoria.score * 100)
        puntajes[clave] = valor
        if (MINIMO > 0 && valor < MINIMO) fallos += 1
      }

      const metricas = extraerMetricas(lhr)
      filas.push({ ruta, puntajes, metricas })
      console.log("")
    }
  } finally {
    await navegador.kill()
  }

  // Tabla resumen
  const columnas = [
    { clave: "performance", titulo: "Perf" },
    { clave: "accessibility", titulo: "Acces" },
    { clave: "best-practices", titulo: "Buenas" },
    { clave: "seo", titulo: "SEO" },
  ].filter((c) => CATEGORIAS.includes(c.clave))

  const anchoRuta = Math.min(
    46,
    Math.max(10, ...filas.map((f) => f.ruta.length)),
  )

  console.log(`${NEGRITA}Resumen${RESET}`)
  console.log(
    GRIS +
      celda("Ruta", anchoRuta) +
      columnas.map((c) => celda(c.titulo, 7)).join("") +
      celda("FCP", 9) +
      celda("LCP", 9) +
      celda("TBT", 8) +
      celda("CLS", 7) +
      RESET,
  )

  for (const fila of filas) {
    let linea = celda(fila.ruta.slice(0, anchoRuta), anchoRuta)
    for (const columna of columnas) {
      const valor = fila.puntajes?.[columna.clave]
      const texto = valor === undefined ? "—" : String(valor)
      linea += celda(`${color(valor)}${texto}${RESET}`, 7)
    }
    linea += celda(formatearMs(fila.metricas?.fcp), 9)
    linea += celda(formatearMs(fila.metricas?.lcp), 9)
    linea += celda(formatearMs(fila.metricas?.tbt), 8)
    linea += celda(numero(fila.metricas?.cls, 3), 7)
    console.log(linea)
  }

  const conPuntaje = filas.filter((f) => f.puntajes?.performance !== undefined)
  const promedio =
    conPuntaje.length > 0
      ? Math.round(
          conPuntaje.reduce((suma, f) => suma + f.puntajes.performance, 0) /
            conPuntaje.length,
        )
      : null

  console.log(
    `\n${NEGRITA}${filas.length}${RESET} ruta(s) auditada(s) · ` +
      `${NEGRITA}Performance promedio: ${color(promedio)}${promedio ?? "—"}${RESET}`,
  )
  console.log(`${GRIS}Informes HTML: ${SALIDA}${RESET}`)

  if (MINIMO > 0 && fallos > 0) {
    console.error(
      `\n${color(0)}${fallos} resultado(s) por debajo de ${MINIMO}.${RESET}`,
    )
    process.exit(1)
  }
}

principal().catch((error) => {
  console.error(`\n${color(0)}Auditoría interrumpida: ${error.message}${RESET}`)
  process.exit(1)
})
