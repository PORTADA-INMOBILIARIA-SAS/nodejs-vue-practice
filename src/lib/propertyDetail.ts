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
