import type { APIRoute } from "astro"

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url)
    const excluir = url.searchParams.get("excluir") || ""

    const paginaAleatoria = Math.floor(Math.random() * 10) + 1
    // Solicitamos solo 4 inmuebles a la API externa de una página aleatoria para rotar
    const apiUrl = `https://api-crinmo.azurewebsites.net/simi/v2.1.1/filtroInmueble/limite/${paginaAleatoria}/total/4/ciudad/0/barrio/0/tipoInm/0/tipOper/1/valmin/500000/valmax/50000000/campo/fecha/precio/0/order/desc/banios/0/alcobas/0/garajes/0/sede/0/usuario/0`

    const control = new AbortController()
    const timeout = setTimeout(() => control.abort(), 6000)

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

    const filtrados = itemsRaw
      .filter((item: any) => {
        const codigo =
          item?.Codigo_Inmueble || item?.idInm || item?.idInmueble || ""
        return String(codigo) !== String(excluir)
      })
      .slice(0, 3)
      .map((item: any) => {
        const simVal =
          Number(
            item.ValorCanon ?? item.Canon ?? item.ValorVenta ?? item.precio,
          ) || 0
        return {
          codigo:
            item.Codigo_Inmueble || item.idInm || item.idInmueble || "N/A",
          tipo: item.Tipo_Inmueble || item.tpinmu || "Inmueble",
          ciudad: item.Ciudad || item.nciudad || "MEDELLÍN",
          barrio: item.Barrio || item.NombreB || item.zona || "Inmueble",
          precio: simVal > 0 ? `$ ${simVal.toLocaleString("es-CO")}` : "",
          imagen: item.foto1 || item.foto || "/img/img4.webp",
          area: Number(item.AreaConstruida) || 0,
          hab: Number(item.Alcobas ?? item.alcobas) || 0,
          banos: Number(item.banios ?? item.Banos) || 0,
          parq: Number(item.garaje ?? item.Garaje) || 0,
        }
      })

    return new Response(JSON.stringify(filtrados), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=180, s-maxage=300",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }
}
