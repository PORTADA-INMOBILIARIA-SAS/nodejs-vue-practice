const STORAGE_KEY = "portada-favorites"

export function getFavorites(): string[] {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function isFav(code: string): boolean {
  if (!code) return false
  return getFavorites().includes(String(code))
}

export function toggleFavorite(code: string): boolean {
  if (!code) return false
  const sCode = String(code)
  let list = getFavorites()
  if (list.includes(sCode)) {
    list = list.filter((c) => c !== sCode)
  } else {
    list.push(sCode)
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {}
  return list.includes(sCode)
}

export function setupPropertyDetail() {
  const raiz = document.getElementById("property-gallery-grid")
  if (!raiz || raiz.dataset.listo === "true") return
  raiz.dataset.listo = "true"

  const dataScript = document.getElementById("property-gallery-data")
  const galleryData = dataScript
    ? JSON.parse(dataScript.textContent || "{}")
    : {}
  const images: string[] = Array.isArray(galleryData.galeria)
    ? galleryData.galeria
    : []
  const codigo: string = galleryData.codigo || ""

  const lightboxModal = document.getElementById("lightbox-modal")
  const lightboxImg = document.getElementById(
    "lightbox-img",
  ) as HTMLImageElement | null
  const lightboxCounter = document.getElementById("lightbox-counter")
  const closeBtn = document.getElementById("close-lightbox")
  const prevBtn = document.getElementById("lightbox-prev")
  const nextBtn = document.getElementById("lightbox-next")

  let currentIdx = 0

  function updateLightbox(index: number) {
    if (images.length === 0) return
    currentIdx = (index + images.length) % images.length
    if (lightboxImg) lightboxImg.src = images[currentIdx]
    if (lightboxCounter)
      lightboxCounter.textContent = `${currentIdx + 1} / ${images.length}`
  }

  function openLightbox(index = 0) {
    if (!lightboxModal) return
    updateLightbox(index)
    lightboxModal.classList.remove("opacity-0", "pointer-events-none")
    document.body.style.overflow = "hidden"
  }

  function closeLightbox() {
    if (!lightboxModal) return
    lightboxModal.classList.add("opacity-0", "pointer-events-none")
    document.body.style.overflow = "auto"
  }

  document.querySelectorAll(".gallery-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const idx = Number(tile.getAttribute("data-index")) || 0
      openLightbox(idx)
    })
  })

  const viewAllBtn = document.getElementById("btn-ver-todas-fotos")
  viewAllBtn?.addEventListener("click", (e) => {
    e.stopPropagation()
    openLightbox(0)
  })

  closeBtn?.addEventListener("click", closeLightbox)
  prevBtn?.addEventListener("click", () => updateLightbox(currentIdx - 1))
  nextBtn?.addEventListener("click", () => updateLightbox(currentIdx + 1))

  lightboxModal?.addEventListener("click", (e) => {
    if (e.target === lightboxModal) closeLightbox()
  })

  document.addEventListener("keydown", (e) => {
    if (
      lightboxModal &&
      !lightboxModal.classList.contains("pointer-events-none")
    ) {
      if (e.key === "ArrowRight") updateLightbox(currentIdx + 1)
      if (e.key === "ArrowLeft") updateLightbox(currentIdx - 1)
      if (e.key === "Escape") closeLightbox()
    }
  })

  const backBtn = document.getElementById("btn-back")
  backBtn?.addEventListener("click", (e) => {
    if (document.referrer && document.referrer.includes("/search")) {
      e.preventDefault()
      window.history.back()
    }
  })

  const favBtn = document.getElementById("btn-save-favorite")
  const heartIcon = document.getElementById("fav-heart-icon")
  const favLabel = document.getElementById("fav-label")

  function renderFavState() {
    const active = isFav(codigo)
    if (heartIcon) {
      if (active) {
        heartIcon.setAttribute("fill", "#ef4444")
        heartIcon.classList.add("text-red-500")
        heartIcon.classList.remove("text-[#333333]")
      } else {
        heartIcon.setAttribute("fill", "none")
        heartIcon.classList.remove("text-red-500")
        heartIcon.classList.add("text-[#333333]")
      }
    }
    if (favLabel) {
      favLabel.textContent = active ? "Guardado" : "Guardar"
    }
  }

  renderFavState()

  favBtn?.addEventListener("click", () => {
    toggleFavorite(codigo)
    renderFavState()
  })

  window.addEventListener("portada:fav-changed", (e: any) => {
    if (e.detail?.code === codigo) {
      renderFavState()
    }
  })

  const shareBtn = document.getElementById("btn-share")
  const shareLabel = document.getElementById("share-label")
  shareBtn?.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      if (shareLabel) {
        const original = shareLabel.textContent
        shareLabel.textContent = "¡Copiado!"
        setTimeout(() => (shareLabel.textContent = original), 2000)
      }
    } catch {
      alert("Enlace copiado al portapapeles")
    }
  })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupPropertyDetail)
} else {
  setupPropertyDetail()
}
document.addEventListener("astro:page-load", setupPropertyDetail)
