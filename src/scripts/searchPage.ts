import { setOptions, importLibrary } from "@googlemaps/js-api-loader"

const STORAGE_KEY = "portada-favorites"

export const readFavorites = function (): string[] {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    return Array.isArray(data) ? data : []
  } catch (e) {
    return []
  }
}

export const saveFavorites = function (list: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {}
}

let mapInstance: any = null
let markersByCode: Record<string, any> = {}

async function initMap() {
  const mapElement = document.getElementById("google-map") as HTMLElement | null
  if (!mapElement) return

  const apiKey =
    mapElement.dataset.apiKey || "AIzaSyAi_z_AaYF8F08wzDeqPd4UYS9iQzWpxXk"

  let Map: any, LatLngBounds: any, AdvancedMarker: any
  try {
    setOptions({ key: apiKey })
    const mapsLib: any = await importLibrary("maps")
    Map = mapsLib.Map
    LatLngBounds = mapsLib.LatLngBounds
    try {
      const markerLib: any = await importLibrary("marker")
      AdvancedMarker = markerLib.AdvancedMarkerElement
    } catch (e) {
      console.warn("AdvancedMarkerElement no disponible:", e)
    }
  } catch (e) {
    console.error("No se pudo cargar Google Maps:", e)
    return
  }

  const dataScript = document.getElementById("map-properties-data")
  const items = dataScript ? JSON.parse(dataScript.textContent || "[]") : []

  if (!mapInstance) {
    mapInstance = new Map(mapElement, {
      center: { lat: 6.2442, lng: -75.5812 },
      zoom: 12,
      mapId: "DEMO_MAP_ID",
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
    })
  }

  Object.values(markersByCode).forEach(function (m: any) {
    if (m.map) m.map = null
    else if (typeof m.setMap === "function") m.setMap(null)
  })
  markersByCode = {}

  if (items.length === 0) return

  const bounds = LatLngBounds ? new LatLngBounds() : null
  let hasValidCoords = false

  items.forEach(function (item: any) {
    if (!item.lat || !item.lng) return

    const lat = Number(item.lat)
    const lng = Number(item.lng)
    if (isNaN(lat) || isNaN(lng)) return

    const position = { lat: lat, lng: lng }
    if (bounds) bounds.extend(position)
    hasValidCoords = true

    // Wrapper: píldora + triángulo debajo
    const wrap = document.createElement("div")
    wrap.className = "map-marker-wrap"
    wrap.dataset.code = String(item.code)

    const pill = document.createElement("div")
    pill.className = "map-price-pill"
    pill.dataset.code = String(item.code)
    pill.textContent = item.formattedPrice || ""

    const tip = document.createElement("div")
    tip.className = "map-marker-tip"

    wrap.appendChild(pill)
    wrap.appendChild(tip)

    let marker: any = null

    if (AdvancedMarker) {
      try {
        marker = new AdvancedMarker({
          map: mapInstance,
          position: position,
          content: wrap,
          title: item.title || item.code,
        })
        marker.element = wrap
        marker.itemPosition = position

        marker.addListener("click", function () {
          highlightProperty(item.code, true)
          if (mapInstance) {
            mapInstance.panTo(position)
            mapInstance.setZoom(15)
          }
        })
        wrap.addEventListener("mouseenter", function () {
          highlightProperty(item.code, false)
        })
        wrap.addEventListener("mouseleave", function () {
          unhighlightProperty(item.code)
        })
      } catch (e) {
        console.warn("Fallo AdvancedMarker, pasando a fallback:", e)
        marker = null
      }
    }

    if (!marker) {
      const googleObj = (window as any).google
      if (googleObj && googleObj.maps) {
        try {
          const OverlayBase = googleObj.maps.OverlayView as any
          const overlay: any = new OverlayBase()
          overlay._pos = position
          overlay._elem = wrap
          overlay.onAdd = function () {
            const pane = this.getPanes().overlayMouseTarget
            pane.appendChild(this._elem)
          }
          overlay.draw = function () {
            const projection = this.getProjection()
            if (!projection) return
            const point = projection.fromLatLngToDivPixel(
              new googleObj.maps.LatLng(this._pos.lat, this._pos.lng),
            )
            if (point) {
              this._elem.style.position = "absolute"
              this._elem.style.left = point.x + "px"
              this._elem.style.top = point.y + "px"
              this._elem.style.transform = "translate(-50%, -100%)"
            }
          }
          overlay.onRemove = function () {
            if (this._elem.parentNode) {
              this._elem.parentNode.removeChild(this._elem)
            }
          }

          overlay.setMap(mapInstance)
          marker = overlay
          marker.element = wrap
          marker.itemPosition = position

          wrap.addEventListener("click", function (e: Event) {
            e.stopPropagation()
            highlightProperty(item.code, true)
            if (mapInstance) {
              mapInstance.panTo(position)
              mapInstance.setZoom(15)
            }
          })
          wrap.addEventListener("mouseenter", function () {
            highlightProperty(item.code, false)
          })
          wrap.addEventListener("mouseleave", function () {
            unhighlightProperty(item.code)
          })
        } catch (overlayErr) {
          if (googleObj.maps.Marker) {
            marker = new googleObj.maps.Marker({
              map: mapInstance,
              position: position,
              icon: {
                path: googleObj.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: "#ff4757",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
                anchor: new googleObj.maps.Point(0, 0),
                labelOrigin: new googleObj.maps.Point(0, -28),
              },
              label: {
                text: item.formattedPrice || "",
                color: "#2a2a33",
                fontSize: "11px",
                fontWeight: "bold",
              },
              title: item.title || item.code,
            })
            marker.itemPosition = position
            marker.addListener("click", function () {
              highlightProperty(item.code, true)
              if (mapInstance) {
                mapInstance.panTo(position)
                mapInstance.setZoom(15)
              }
            })
          }
        }
      }
    }

    if (marker) markersByCode[item.code] = marker
  })

  if (hasValidCoords && bounds && mapInstance) {
    mapInstance.fitBounds(bounds)
    const gObj = (window as any).google
    if (gObj && gObj.maps) {
      const listener = gObj.maps.event.addListener(
        mapInstance,
        "idle",
        function () {
          if (mapInstance.getZoom() > 14) mapInstance.setZoom(14)
          if (mapInstance.getZoom() < 10) mapInstance.setZoom(12)
          gObj.maps.event.removeListener(listener)
        },
      )
    }
  }

  setupCardInteractions()
}

function highlightProperty(code: string | number, scrollTo: boolean) {
  document
    .querySelectorAll<HTMLElement>(".map-marker-wrap")
    .forEach(function (el) {
      if (el.dataset.code === String(code)) el.classList.add("active")
      else el.classList.remove("active")
    })
  document
    .querySelectorAll<HTMLElement>(".map-price-pill")
    .forEach(function (el) {
      if (el.dataset.code === String(code)) el.classList.add("active")
      else el.classList.remove("active")
    })

  document
    .querySelectorAll<HTMLElement>(".property-map-card")
    .forEach(function (card) {
      if (card.dataset.code === String(code)) {
        card.classList.add("ring-2", "ring-[#2a2a33]", "shadow-lg")
        if (scrollTo) {
          card.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      } else {
        card.classList.remove("ring-2", "ring-[#2a2a33]", "shadow-lg")
      }
    })
}

function unhighlightProperty(code: string | number) {
  const wrap = document.querySelector(
    '.map-marker-wrap[data-code="' + code + '"]',
  )
  wrap?.classList.remove("active")
  const pill = document.querySelector(
    '.map-price-pill[data-code="' + code + '"]',
  )
  pill?.classList.remove("active")
  const card = document.querySelector(
    '.property-map-card[data-code="' + code + '"]',
  )
  card?.classList.remove("ring-2", "ring-[#2a2a33]", "shadow-lg")
}

function setupCardInteractions() {
  document
    .querySelectorAll<HTMLElement>(".property-map-card")
    .forEach(function (card) {
      if (card.dataset.interactionBound === "true") return
      card.dataset.interactionBound = "true"
      const code = card.dataset.code
      if (!code) return

      card.addEventListener("mouseenter", function () {
        const marker: any = markersByCode[code]
        if (marker) {
          const el: HTMLElement | null =
            marker.element ||
            document.querySelector<HTMLElement>(
              '.map-marker-wrap[data-code="' + code + '"]',
            ) ||
            document.querySelector<HTMLElement>(
              '.map-price-pill[data-code="' + code + '"]',
            )
          el?.classList.add("active")
        }
      })

      card.addEventListener("mouseleave", function () {
        const marker: any = markersByCode[code]
        if (marker) {
          const el: HTMLElement | null =
            marker.element ||
            document.querySelector<HTMLElement>(
              '.map-marker-wrap[data-code="' + code + '"]',
            ) ||
            document.querySelector<HTMLElement>(
              '.map-price-pill[data-code="' + code + '"]',
            )
          el?.classList.remove("active")
        }
      })

      card.addEventListener("click", function (e: MouseEvent) {
        const target = e.target as HTMLElement
        if (target.closest("button[data-favorite]")) return

        const isDirectLink = target.closest(".property-link-btn")
        if (isDirectLink && (e.metaKey || e.ctrlKey)) {
          return
        }
        if (isDirectLink) {
          e.preventDefault()
        }

        const marker: any = markersByCode[code]
        const lat = Number(card.dataset.lat)
        const lng = Number(card.dataset.lng)
        const pos =
          (marker && (marker.itemPosition || marker.position)) ||
          (!isNaN(lat) && !isNaN(lng) && lat && lng
            ? { lat: lat, lng: lng }
            : null)

        if (mapInstance && pos) {
          mapInstance.panTo(pos)
          mapInstance.setZoom(16)
        }

        highlightProperty(code, false)
      })
    })
}

export const switchViewFn = function (view: string) {
  const listBtn = document.getElementById("view-list-btn")
  const mapBtn = document.getElementById("view-map-btn")
  const gridView = document.getElementById("grid-view-container")
  const mapView = document.getElementById("map-view-container")

  if (view === "map") {
    if (listBtn) {
      listBtn.classList.remove(
        "bg-white",
        "font-medium",
        "text-[#2a2a33]",
        "shadow-sm",
      )
      listBtn.classList.add("text-[#5e5e68]")
    }
    if (mapBtn) {
      mapBtn.classList.add(
        "bg-white",
        "font-medium",
        "text-[#2a2a33]",
        "shadow-sm",
      )
      mapBtn.classList.remove("text-[#5e5e68]")
    }
    if (gridView) {
      gridView.style.display = "none"
      gridView.classList.add("hidden")
      gridView.classList.remove("block")
    }
    if (mapView) {
      mapView.style.display = "block"
      mapView.classList.remove("hidden")
      mapView.classList.add("block")
    }

    initMap()

    try {
      const urlMap = new URL(window.location.href)
      urlMap.searchParams.set("view", "map")
      window.history.replaceState({}, "", urlMap.toString())
    } catch (e) {}
  } else {
    if (mapBtn) {
      mapBtn.classList.remove(
        "bg-white",
        "font-medium",
        "text-[#2a2a33]",
        "shadow-sm",
      )
      mapBtn.classList.add("text-[#5e5e68]")
    }
    if (listBtn) {
      listBtn.classList.add(
        "bg-white",
        "font-medium",
        "text-[#2a2a33]",
        "shadow-sm",
      )
      listBtn.classList.remove("text-[#5e5e68]")
    }
    if (mapView) {
      mapView.style.display = "none"
      mapView.classList.add("hidden")
      mapView.classList.remove("block")
    }
    if (gridView) {
      gridView.style.display = "block"
      gridView.classList.remove("hidden")
      gridView.classList.add("block")
    }

    try {
      const urlList = new URL(window.location.href)
      urlList.searchParams.delete("view")
      window.history.replaceState({}, "", urlList.toString())
    } catch (e) {}
  }
}

;(window as any).switchView = switchViewFn

export function initSearchPage() {
  const listBtn = document.getElementById("view-list-btn")
  const mapBtn = document.getElementById("view-map-btn")
  if (listBtn && !listBtn.dataset.bound) {
    listBtn.dataset.bound = "true"
    listBtn.addEventListener("click", function () {
      ;(window as any).switchView("list")
    })
  }
  if (mapBtn && !mapBtn.dataset.bound) {
    mapBtn.dataset.bound = "true"
    mapBtn.addEventListener("click", function () {
      ;(window as any).switchView("map")
    })
  }

  const currentView = new URL(window.location.href).searchParams.get("view")
  if (currentView === "map") {
    ;(window as any).switchView("map")
  }

  setupCardInteractions()

  const form = document.getElementById("results-form") as HTMLFormElement | null
  if (form && form.dataset.ready !== "true") {
    form.dataset.ready = "true"

    form.addEventListener("change", function (event: Event) {
      const target = event.target
      if (!(target instanceof HTMLSelectElement)) return
      if (target.name === "mode") {
        const budget = form.elements.namedItem(
          "budget",
        ) as HTMLInputElement | null
        if (budget) budget.value = ""
      }
      form.requestSubmit()
    })

    const cityInput = document.getElementById(
      "f-city",
    ) as HTMLInputElement | null
    if (cityInput) {
      cityInput.addEventListener("change", function () {
        form.requestSubmit()
      })
    }

    form.addEventListener("submit", function () {
      const formEls = Array.from(form.elements) as HTMLElement[]
      const emptyFields = formEls.filter(function (element) {
        return (
          (element instanceof HTMLInputElement ||
            element instanceof HTMLSelectElement) &&
          element.name !== "" &&
          element.value.trim() === ""
        )
      }) as (HTMLInputElement | HTMLSelectElement)[]
      emptyFields.forEach(function (element) {
        element.disabled = true
      })
      setTimeout(function () {
        emptyFields.forEach(function (element) {
          element.disabled = false
        })
      }, 0)
    })
  }

  // Botón "Ver en mapa" (general)
  const btnGeneralMap = document.getElementById("btn-open-general-map")
  const generalMapContainer = document.getElementById("general-map-container")
  const resultsWrapper = document.getElementById("results-content-wrapper")
  if (btnGeneralMap && !btnGeneralMap.dataset.bound) {
    btnGeneralMap.dataset.bound = "true"

    if (sessionStorage.getItem("portada_general_map_open") === "true") {
      if (generalMapContainer) {
        generalMapContainer.classList.remove("hidden")
        if (resultsWrapper) resultsWrapper.classList.add("hidden")
        btnGeneralMap.classList.add("ring-2", "ring-[#ffaaa0]")
        setTimeout(function () {
          if (typeof (window as any).triggerGeneralMapResize === "function") {
            ;(window as any).triggerGeneralMapResize()
          }
        }, 300)
      }
    }

    btnGeneralMap.addEventListener("click", function () {
      if (!generalMapContainer) return
      const isHidden = generalMapContainer.classList.contains("hidden")
      if (isHidden) {
        sessionStorage.setItem("portada_general_map_open", "true")
        generalMapContainer.classList.remove("hidden")
        if (resultsWrapper) resultsWrapper.classList.add("hidden")
        btnGeneralMap.classList.add("ring-2", "ring-[#ffaaa0]")
        setTimeout(function () {
          if (typeof (window as any).triggerGeneralMapResize === "function") {
            ;(window as any).triggerGeneralMapResize()
          }
          generalMapContainer.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }, 300)
      } else {
        sessionStorage.removeItem("portada_general_map_open")
        generalMapContainer.classList.add("hidden")
        if (resultsWrapper) resultsWrapper.classList.remove("hidden")
        btnGeneralMap.classList.remove("ring-2", "ring-[#ffaaa0]")
      }
    })
  }

  // Manejo de favoritos
  const favorites = new Set<string>(readFavorites())
  document
    .querySelectorAll<HTMLElement>("button[data-favorite]")
    .forEach(function (button) {
      if (button.dataset.bound) return
      button.dataset.bound = "true"
      const code = button.dataset.favorite || ""
      button.setAttribute("aria-pressed", String(favorites.has(code)))
      button.addEventListener("click", function (e) {
        e.stopPropagation()
        if (favorites.has(code)) favorites.delete(code)
        else favorites.add(code)

        document
          .querySelectorAll<HTMLElement>('button[data-favorite="' + code + '"]')
          .forEach(function (btn) {
            btn.setAttribute("aria-pressed", String(favorites.has(code)))
          })

        saveFavorites(Array.from(favorites))
      })
    })

  const viewButton = document.getElementById("view-favorites")
  const notice = document.getElementById("favorites-notice")
  if (viewButton && !viewButton.dataset.bound) {
    viewButton.dataset.bound = "true"
    viewButton.addEventListener("click", function () {
      const list = readFavorites()
      if (list.length === 0) {
        if (notice) notice.textContent = "Aún no tienes inmuebles favoritos."
        alert(
          "Aún no tienes inmuebles guardados en favoritos. Haz clic en el corazón de cualquier inmueble para guardarlo.",
        )
        return
      }
      location.href = "/search?favorites=" + encodeURIComponent(list.join(","))
    })
  }

  const urlParams = new URLSearchParams(location.search)
  if (urlParams.get("favorites") === "all") {
    const favs = readFavorites()
    if (favs.length > 0) {
      location.replace(
        "/search?favorites=" + encodeURIComponent(favs.join(",")),
      )
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSearchPage, { once: true })
} else {
  initSearchPage()
}
document.addEventListener("astro:page-load", initSearchPage)
