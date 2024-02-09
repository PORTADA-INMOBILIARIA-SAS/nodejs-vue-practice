import type { APIRoute } from "astro"

export const GET: APIRoute = async ({ request }) => {
  try {
    // Obtener los parámetros de consulta de la solicitud
    const queryParams = new URL(request.url).searchParams

    // Construir la URL base de la API de Simi
    let url =
      "https://www.simi-api.com/ApiSimiweb/response/v2.1.1/filtroInmueble/limite/1/total/12/"

    // Añadir los filtros proporcionados en los parámetros de consulta a la URL
    queryParams.forEach((value, key) => {
      url += `${key}/${encodeURIComponent(value)}/`
    })

    // Realizar la solicitud a la API de Simi
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${btoa(`Authorization:${import.meta.env.SECRET_SIMI_API_KEY}`)}`,
      },
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
  }
}
