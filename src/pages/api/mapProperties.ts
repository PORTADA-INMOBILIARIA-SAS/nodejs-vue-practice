import type { APIRoute } from "astro"
import { fetchSimiPropertiesCached } from "../../lib/simiApi"
import { resolvePropertyCoordinates } from "../../lib/coordinates"
import type { Mode } from "../../lib/propertyCatalog"

export const prerender = false

const currency = new Intl.NumberFormat("es-CO")

export const GET: APIRoute = async ({ url }) => {
  const mode = (url.searchParams.get("mode") || "rent") as Mode
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10))
  const perPage = Math.min(
    50,
    Math.max(10, parseInt(url.searchParams.get("perPage") || "30", 10)),
  )

  try {
    const result = await fetchSimiPropertiesCached({
      mode,
      page,
      perPage,
    })

    const properties = result.items.map((p) => {
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

    return new Response(
      JSON.stringify({
        items: properties,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        page,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=120, s-maxage=600",
        },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error al consultar la API de Simi", items: [] }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
