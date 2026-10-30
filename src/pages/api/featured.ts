import type { APIRoute } from "astro"

export const GET: APIRoute = async () => {
  try {
    // Escogemos una página aleatoria entre 1 y 15 para traer 5 inmuebles distintos y frescos
    const pagina = Math.floor(Math.random() * 15) + 1
    const apiUrl = `https://api-crinmo.azurewebsites.net/simi/v2.1.1/filtroInmueble/limite/${pagina}/total/5/ciudad/0/barrio/0/tipoInm/0/tipOper/0/valmin/0/valmax/0/campo/fecha/precio/0/order/desc/banios/0/alcobas/0/garajes/0/sede/0/usuario/0`

    const control = new AbortController()
    const timeout = setTimeout(() => control.abort(), 7000)

    let itemsRaw: any[] = []
    try {
      const res = await fetch(apiUrl, {
        signal: control.signal,
        headers: { Accept: "application/json" },
      })
      if (res.ok) {
        const data = await res.json()
        const lista = data?.Inmuebles
          ? Object.values(data.Inmuebles)
          : Array.isArray(data)
            ? data
            : []
        itemsRaw = Array.isArray(lista) ? lista : []
      }
    } finally {
      clearTimeout(timeout)
    }

    // Si por alguna razón la página aleatoria falla o viene vacía, intentamos con la primera
    if (itemsRaw.length === 0) {
      const resFallback = await fetch(
        "https://api-crinmo.azurewebsites.net/simi/v21/inmueblesDestacados/total/5/limite/2",
      )
      if (resFallback.ok) {
        const dataFallback = await resFallback.json()
        itemsRaw = Array.isArray(dataFallback)
          ? dataFallback
          : Object.values(dataFallback || {})
      }
    }

    return new Response(JSON.stringify(itemsRaw), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }
}
