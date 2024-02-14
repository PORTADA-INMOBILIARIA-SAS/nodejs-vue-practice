<template>
  <div>
    <div v-if="isLoading" class="w-full flex justify-center mt-8">
      <div role="status">
        <svg
          aria-hidden="true"
          class="w-16 h-16 animate-spin text-gray-600 fill-[--primary-color]"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
    </div>
    <div v-else-if="hayInmuebles === 0" class="flex justify-center mt-8">
      <span class="text-lg font-semibold text-gray-700">Sin Resultados</span>
    </div>
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 my-14"
    >
      <CardInmueble
        v-for="inmueble in inmuebles"
        :key="inmueble.Codigo_Inmueble"
        :inmueble="inmueble"
      />
    </div>
    <div
      v-if="!isLoading && hayInmuebles != 0"
      class="flex justify-center items-center my-4"
    >
      <div v-if="totalPages > 0" class="flex justify-center flex-wrap">
        <button
          v-for="pageNumber in displayedPages"
          :key="pageNumber"
          @click="changePage(pageNumber)"
          :class="[
            'mx-1 px-3 py-1 rounded cursor-pointer mt-2',
            pageNumber === currentPage
              ? 'bg-[--primary-color] text-white'
              : 'bg-gray-200 hover:bg-gray-300',
          ]"
        >
          {{ pageNumber }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import CardInmueble from "./CardInmueble.vue"
import { useStore } from "@nanostores/vue"
import { filtros } from "./filtroStore"

const inmuebles = ref([])
const isLoading = ref(false)
const $filtros = useStore(filtros)
const currentPage = ref(1)
const totalPages = ref(1)
const hayInmuebles = ref(0)
const displayedPages = ref([])

let updateTimer = null

const fetchData = async (page = 1) => {
  try {
    isLoading.value = true

    let url = `/api/inmueblesFiltro`

    // Construir la cadena de consulta para los parámetros de filtro
    const queryParams = new URLSearchParams()
    queryParams.set("limite", currentPage.value)
    queryParams.set("ciudad", $filtros.value.ciudad)
    queryParams.set("barrio", $filtros.value.barrio)
    queryParams.set("tipoInm", $filtros.value.tipoInm)
    queryParams.set("tipOper", $filtros.value.tipOper)
    queryParams.set("valmin", $filtros.value.valmin)
    queryParams.set("valmax", $filtros.value.valmax)
    queryParams.set("banios", $filtros.value.banios)
    queryParams.set("alcobas", $filtros.value.alcobas)
    queryParams.set("garajes", $filtros.value.garajes)

    // Agregar la cadena de consulta a la URL
    url += `?${queryParams.toString()}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error al obtener los inmuebles: ${response.statusText}`)
    } else {
      isLoading.value = false
    }

    const data = await response.json()
    inmuebles.value = data.Inmuebles

    hayInmuebles.value = data.datosGrales ? 1 : 0

    // Actualizar el número total de páginas
    totalPages.value = data.datosGrales.fin

    displayedPages.value = calculateDisplayedPages(currentPage.value)
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Error:", error.message)
    }
  }
}

const calculateDisplayedPages = (page) => {
  const maxDisplayed = 10 // Número máximo de páginas mostradas antes de insertar "..."
  const maxAdjacent = (maxDisplayed - 1) / 2
  const firstPage = Math.max(1, Math.floor(page - maxAdjacent)) // Redondear hacia abajo
  const lastPage = Math.min(
    totalPages.value,
    Math.ceil(firstPage + maxDisplayed - 1),
  ) // Redondear hacia arriba

  const pages = []

  if (firstPage > 1) {
    pages.push(1)
    if (firstPage > 2) {
      pages.push("...")
    }
  }

  for (let i = firstPage; i <= lastPage; i++) {
    pages.push(i)
  }

  if (lastPage < totalPages.value) {
    if (lastPage < totalPages.value - 1) {
      pages.push("...")
    }
    pages.push(totalPages.value)
  }

  return pages
}

const startFetchDataTimer = () => {
  if (updateTimer) {
    clearTimeout(updateTimer)
  }

  updateTimer = setTimeout(() => {
    fetchData(currentPage.value)
  }, 500)
}

onMounted(() => {
  fetchData(currentPage.value)
  displayedPages.value = calculateDisplayedPages(currentPage.value)
})

watch(
  () => Object.values($filtros.value),
  (newValues, oldValues) => {
    if (JSON.stringify(newValues) !== JSON.stringify(oldValues)) {
      // GUARDAMOS EL FILTRO EN EL LOCAL STORAGE CUANDO SE DETECTAN CAMBIOS Y RETORNAMOS A LA PRIMERA PAGINA

      currentPage.value = 1
      localStorage.setItem("filtros", JSON.stringify($filtros.value))
      startFetchDataTimer()
    }
  },
)

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page
    displayedPages.value = calculateDisplayedPages(page)
    fetchData(page)
  }
}
</script>
