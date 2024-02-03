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
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 my-14"
    >
      <CardInmueble
        v-for="inmueble in inmuebles"
        :key="inmueble.id"
        :inmueble="inmueble"
      />
    </div>
    <div v-if="!isLoading" class="flex justify-center items-center my-4">
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
        class="px-4 py-2 mx-2 bg-[--primary-color] text-white rounded cursor-pointer"
      >
        Anterior
      </button>
      <span class="mx-2">Página {{ currentPage }} de {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
        class="px-4 py-2 mx-2 bg-[--primary-color] text-white rounded cursor-pointer"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from "vue"
import CardInmueble from "./CardInmueble.vue"
import { useStore } from "@nanostores/vue"
import { filtros } from "./filtroStore"

const inmuebles = ref([])
const isLoading = ref(false)
const $filtros = useStore(filtros)
const lastFilter = ref({})
const currentPage = ref(1)
const totalPages = ref(1)
let updateTimer = null
let controller = null

const fetchData = async (page = 1) => {
  try {
    isLoading.value = true

    if (controller) {
      controller.abort()
    }

    controller = new AbortController()
    const signal = controller.signal

    const apiUrl = `https://www.simi-api.com/ApiSimiweb/response/v2.1.1/filtroInmueble/limite/${page}/total/12/ciudad/0/barrio/0/tipoInm/0/tipOper/1/valmin/${$filtros.value.valMin || 700000}/valmax/${$filtros.value.valMax || 50000000}/campo/fecha/precio/0/order/desc/banios/${$filtros.value.banos || 0}/alcobas/${$filtros.value.habitaciones || 0}/garajes/${$filtros.value.parking || 0}/sede/0/usuario/0`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization:
          "Basic " +
          btoa(`Authorization:${import.meta.env.PUBLIC_SIMI_API_KEY}`),
      },
      signal,
    })

    if (!response.ok) {
      throw new Error(`Error al obtener los inmuebles: ${response.statusText}`)
    }

    const data = await response.json()
    inmuebles.value = data.Inmuebles

    // Actualizar el último filtro almacenado
    lastFilter.value = { ...$filtros.value }

    // Actualizar el número total de páginas
    totalPages.value = Math.ceil(data.datosGrales.totalInmuebles / 12)
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Error:", error.message)
    }
  } finally {
    isLoading.value = false
  }
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
  lastFilter.value = { ...$filtros.value }
})

watchEffect(() => {
  if (JSON.stringify($filtros.value) !== JSON.stringify(lastFilter.value)) {
    startFetchDataTimer()
  }
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page
    fetchData(page)
  }
}
</script>
