<template>
  <div>
    <div v-if="is_loading" class="w-full flex justify-center mt-8">
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
    <div v-else-if="hay_inmuebles === 0" class="flex justify-center mt-8">
      <span class="text-lg font-semibold text-gray-700">Sin Resultados</span>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-8 my-14">
      <PropertyCard
        v-for="inmueble in lista_inmuebles"
        :key="inmueble.Codigo_Inmueble"
        :inmueble="inmueble"
      />
    </div>
    <div
      v-if="!is_loading && hay_inmuebles != 0"
      class="flex justify-center items-center my-4"
    >
      <div v-if="total_pages > 0" class="flex justify-center flex-wrap">
        <button
          v-for="page_number in displayed_pages"
          :key="page_number"
          @click="changePage(page_number)"
          :class="[
            'mx-1 px-3 py-1 rounded cursor-pointer mt-2',
            page_number === current_page
              ? 'bg-[--primary-color] text-white'
              : 'bg-gray-200 hover:bg-gray-300',
          ]"
        >
          {{ page_number }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import PropertyCard from "./PropertyCard.vue"

const lista_inmuebles = ref([])
const is_loading = ref(false)
const current_page = ref(1)
const total_pages = ref(1)
const hay_inmuebles = ref(0)
const displayed_pages = ref([])

const fetchData = async (target_page = 1) => {
  try {
    is_loading.value = true

    // 1. Leemos los parámetros nativos enviados por el formulario SSR en la URL
    const url_params = new URLSearchParams(window.location.search)

    // 2. Mapeamos las claves de la URL con las que espera la API
    const tipo_operacion = url_params.get("operacion") || ""
    const tipo_inmueble = url_params.get("tipoInmueble") || "0"
    const ubicacion_inmueble = url_params.get("ubicacion") || "0"
    const codigo_inmueble = url_params.get("codigo") || ""

    // 3. Construimos la petición
    const query_params = new URLSearchParams()
    query_params.set("limite", target_page)
    query_params.set(
      "tipOper",
      tipo_operacion === "arriendo"
        ? "1"
        : tipo_operacion === "venta"
          ? "2"
          : "0",
    )
    query_params.set("tipoInm", tipo_inmueble)
    query_params.set("ciudad", ubicacion_inmueble)
    query_params.set("codigo", codigo_inmueble)

    const response_api = await fetch(
      `/api/propertiesFilter?${query_params.toString()}`,
    )

    if (!response_api.ok) {
      throw new Error(
        `Error al obtener los inmuebles: ${response_api.statusText}`,
      )
    }

    const json_data = await response_api.json()
    lista_inmuebles.value = json_data.Inmuebles || []

    hay_inmuebles.value =
      json_data.datosGrales && lista_inmuebles.value.length > 0 ? 1 : 0
    total_pages.value = json_data.datosGrales?.fin || 1

    displayed_pages.value = calculateDisplayedPages(target_page)
  } catch (error) {
    console.error("Error cargando inmuebles:", error.message)
    hay_inmuebles.value = 0
  } finally {
    is_loading.value = false
  }
}

const calculateDisplayedPages = (target_page) => {
  const max_displayed = 10
  const max_adjacent = (max_displayed - 1) / 2
  const first_page = Math.max(1, Math.floor(target_page - max_adjacent))
  const last_page = Math.min(
    total_pages.value,
    Math.ceil(first_page + max_displayed - 1),
  )

  const pages_list = []

  if (first_page > 1) {
    pages_list.push(1)
    if (first_page > 2) pages_list.push(" ...")
  }

  for (let i = first_page; i <= last_page; i++) {
    pages_list.push(i)
  }

  if (last_page < total_pages.value) {
    if (last_page < total_pages.value - 1) pages_list.push("...")
    pages_list.push(total_pages.value)
  }

  return pages_list
}

onMounted(() => {
  fetchData(current_page.value)
})

const changePage = (new_page) => {
  if (
    typeof new_page === "number" &&
    new_page >= 1 &&
    new_page <= total_pages.value &&
    new_page !== current_page.value
  ) {
    current_page.value = new_page
    fetchData(new_page)
  }
}
</script>
