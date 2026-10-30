import type { APIRoute } from "astro"

export const GET: APIRoute = async () => {
  try {
    const api_response = await fetch(
      "https://simi-api.com/ApiSimiweb/response/v2/ciudad/idDepartamento/0",
      {
        headers: {
          Authorization: `Basic ${btoa(`Authorization:${import.meta.env.SECRET_SIMI_API_KEY}`)}`,
        },
      },
    )

    if (!api_response.ok) {
      throw new Error(`La solicitud falló con estado ${api_response.status}`)
    }

    const raw_text = await api_response.text()

    // Parseo seguro de la respuesta
    let response_data
    try {
      response_data = JSON.parse(raw_text)
    } catch {
      response_data = raw_text
    }

    return new Response(JSON.stringify(response_data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Error al procesar la solicitud: ${error}` }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
