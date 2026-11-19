export function extraerFotos(item: any): string[] {
  if (!item) return []

  const lista: string[] = []

  if (item.foto1) lista.push(item.foto1)
  if (item.Foto1) lista.push(item.Foto1)
  if (item.foto) lista.push(item.foto)
  if (item.Foto) lista.push(item.Foto)

  for (let i = 2; i <= 30; i++) {
    if (item[`foto${i}`]) lista.push(item[`foto${i}`])
    if (item[`Foto${i}`]) lista.push(item[`Foto${i}`])
  }

  const fotosArray =
    item.fotos || item.Fotos || item.fotosInmueble || item.FotosInmueble

  if (Array.isArray(fotosArray)) {
    fotosArray.forEach((f: any) => {
      const url = typeof f === "string" ? f : f?.foto || f?.Foto || f?.url
      if (url && typeof url === "string" && url.trim()) lista.push(url.trim())
    })
  }

  return [...new Set(lista)].filter(
    (url) => typeof url === "string" && url.trim() !== "",
  )
}

export function getCardHeadline(barrioText: string): string {
  const clean = (barrioText || "").toLowerCase()
  if (clean.includes("laureles") || !barrioText)
    return "Un balcón para empezar el día."
  if (clean.includes("esmeraldal")) return "Tu refugio entre verde y ciudad."
  if (clean.includes("otra parte")) return "Espacio lleno de luz y confort."
  if (clean.includes("poblado")) return "Exclusividad, calma y la mejor vista."
  if (clean.includes("suramerica") || clean.includes("suramérica"))
    return "Modernidad para compartir en familia."
  if (clean.includes("colores")) return "Tranquilidad y cercanía a todo."
  if (clean.includes("belen") || clean.includes("belén"))
    return "Tu próximo hogar en un punto ideal."
  if (clean.includes("primavera"))
    return "Vistas abiertas y excelente ubicación."
  return "Un balcón para empezar el día."
}

export function formatWhatsAppUrl(
  telefonoOriginal: string,
  texto: string,
): string {
  const telefonoLimpio = String(telefonoOriginal || "").replace(/\D/g, "")
  const asesorTelefono = telefonoLimpio
    ? telefonoLimpio.startsWith("57")
      ? telefonoLimpio
      : telefonoLimpio.length === 10
        ? `57${telefonoLimpio}`
        : telefonoLimpio
    : ""

  return asesorTelefono
    ? `https://wa.me/${asesorTelefono}?text=${encodeURIComponent(texto)}`
    : "#"
}
