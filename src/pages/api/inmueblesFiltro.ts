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

    // Construir la URL base de la API de Simi
    let url =
      "https://www.simi-api.com/ApiSimiweb/response/v2.1.1/filtroInmueble/total/12/"

    // Construir un objeto que mapee los parámetros a sus valores predeterminados
    const defaultParams = {
      limite: "1",
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

    // Actualizar los valores predeterminados con los parámetros proporcionados en la solicitud
    for (const [param, value] of queryParams.entries()) {
      // Utiliza una aserción de tipo para asegurar a TypeScript que param es una clave válida
      ;(defaultParams as Record<string, string>)[param] = value
    }

    // Convertir el objeto de parámetros en una cadena de consulta
    const paramString = Object.entries(defaultParams)
      .map(([key, value]) => `${key}/${value}`)
      .join("/")

    // Agregar los parámetros a la URL base
    url += paramString

    // Realizar la solicitud a la API de Simi
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${btoa(`Authorization:${import.meta.env.SECRET_SIMI_API_KEY}`)}`,
      },
      signal: currentController.signal,
    })

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error(`La solicitud falló con estado ${response.status}`)
    }

    // Leer el cuerpo de la respuesta como texto
    const responseBody = await response.text()

    // Devolver una respuesta exitosa con el cuerpo de la respuesta
    return new Response(responseBody, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    // Si ocurre algún error, devolver una respuesta de error
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
