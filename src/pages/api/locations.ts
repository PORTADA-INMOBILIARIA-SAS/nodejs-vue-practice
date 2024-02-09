import type { APIRoute } from "astro"

export const GET: APIRoute = async () => {
  try {
    const response = await fetch(
      "https://simi-api.com/ApiSimiweb/response/v2/ciudad/idDepartamento/0",
      {
        headers: {
          Authorization: `Basic ${btoa(`Authorization:${import.meta.env.SECRET_SIMI_API_KEY}`)}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`La solicitud falló con estado ${response.status}`)
    }

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
