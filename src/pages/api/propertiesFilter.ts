import type { APIRoute } from "astro"

let lastController: AbortController | null = null

export const GET: APIRoute = async ({ request }) => {
  let currentController = new AbortController()

  try {
    // Cancela la solicitud anterior si hay una nueva solicitud en curso
    if (lastController) {
      lastController.abort()
    }

    lastController = currentController

    // Obtener los parámetros de consulta de la solicitud
    const queryParams = new URL(request.url).searchParams

    // URL base de la API de inmuebles (esta dirección no requiere clave)
    let url = "https://api-crinmo.azurewebsites.net/simi/v2.1.1/filtroInmueble/"

    // Parámetros con sus valores predeterminados.
    // El orden importa: la API espera limite y total primero.
    const defaultParams = {
      limite: "1",
      total: "12",
      ciudad: "0",
      barrio: "0",
      tipoInm: "0",
      tipOper: "1",
      valmin: "700000",
      valmax: "50000000",
      campo: "fecha",
      precio: "0",
      order: "desc",
      banios: "0",
      alcobas: "0",
      garajes: "0",
      sede: "0",
      usuario: "0",
    }

    // Actualizar los valores predeterminados con los parámetros de la solicitud
    for (const [param, value] of queryParams.entries()) {
      ;(defaultParams as Record<string, string>)[param] = value
    }

    // Convertir el objeto de parámetros en la ruta que espera la API
    const paramString = Object.entries(defaultParams)
      .map(([key, value]) => `${key}/${value}`)
      .join("/")

    url += paramString

    // Solicitud a la API (sin cabecera de autorización)
    const response = await fetch(url, {
      signal: currentController.signal,
    })

    if (!response.ok) {
      throw new Error(`La solicitud falló con estado ${response.status}`)
    }

    const responseBody = await response.text()

    return new Response(responseBody, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    return new Response(`Error al procesar la solicitud: ${error}`, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } finally {
    // Limpia la referencia al controlador actual
    lastController = null
  }
}
