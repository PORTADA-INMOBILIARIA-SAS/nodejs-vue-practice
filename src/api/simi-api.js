export const inmueblesFiltro = async (page, filtros, signal) => {
  try {
    const apiUrl = `https://www.simi-api.com/ApiSimiweb/response/v2.1.1/filtroInmueble/limite/${page}/total/12/ciudad/${filtros.ciudadSelec || null}/barrio/${filtros.barrioSelec || null}/tipoInm/${filtros.tipoInmu || 0}/tipOper/${filtros.gestion || 1}/valmin/${filtros.valMin || 700000}/valmax/${filtros.valMax || 50000000}/campo/fecha/precio/0/order/desc/banios/${filtros.banos || 0}/alcobas/${filtros.habitaciones || 0}/garajes/${filtros.parking || 0}/sede/0/usuario/0`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization:
          "Basic " +
          btoa(`Authorization:${import.meta.env.PUBLIC_SIMI_API_KEY}`),
      },
      signal: signal,
    })

    if (!response.ok) {
      throw new Error(`Error al obtener los inmuebles: ${response.statusText}`)
    }

    const data = await response.json()
    const inmuebles = data.Inmuebles
    const hayInmuebles = data.datosGrales ? 1 : 0
    const totalPages = data.datosGrales.fin

    return { inmuebles, hayInmuebles, totalPages }
  } catch (error) {
    console.error("Error:", error.message)
    throw error
  }
}
