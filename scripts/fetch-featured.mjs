import fs from "node:fs/promises"
import path from "node:path"

const URL_API =
  "https://api-crinmo.azurewebsites.net/simi/v21/inmueblesDestacados/total/5/limite/2"
const SALIDA = path.resolve("src/data/destacados.json")

async function pedir(intento = 1) {
  const control = new AbortController()
  const temporizador = setTimeout(() => control.abort(), 30000)
  try {
    const respuesta = await fetch(URL_API, { signal: control.signal })
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`)
    return await respuesta.json()
  } catch (error) {
    if (intento >= 3) throw error
    await new Promise((resolver) => setTimeout(resolver, 2000 * intento))
    return pedir(intento + 1)
  } finally {
    clearTimeout(temporizador)
  }
}

function tieneDatos(datos) {
  if (Array.isArray(datos)) return datos.length > 0
  return (
    datos !== null && typeof datos === "object" && Object.keys(datos).length > 0
  )
}

try {
  const datos = await pedir()
  if (!tieneDatos(datos)) throw new Error("La API respondió sin inmuebles")
  await fs.mkdir(path.dirname(SALIDA), { recursive: true })
  await fs.writeFile(SALIDA, JSON.stringify(datos))
  console.log("Destacados guardados en", SALIDA)
} catch (error) {
  console.warn("No se actualizaron los destacados:", error.message)
}
