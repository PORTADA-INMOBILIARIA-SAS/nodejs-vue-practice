<template>
  <div class="col-span-2 md:col-span-1">
    <Select
      localStorage="tipOper"
      :svg="`<svg class='icon icon-tabler icon-tabler-home' width='20' height='20'
                viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' fill='none' stroke-linecap='round'
                stroke-linejoin='round'>
                <path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
                <path d='M5 12l-2 0l9 -9l9 9l-2 0'></path>
                <path d='M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7'></path>
                <path d='M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6'></path>
                </svg>`"
      :options="[
        { id: 1, nombre: 'Arrendar' },
        { id: 5, nombre: 'Comprar' },
      ]"
    />
  </div>

  <div class="col-span-2 md:col-span-1">
    <Select
      localStorage="tipoInm"
      :svg="`<svg xmlns='http://www.w3.org/2000/svg'
                class='icon icon-tabler icon-tabler-key' width='20' height='20' viewBox='0 0 24 24' stroke-width='2'
                stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'>
                <path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
                <path
                    d='M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z'>
                </path>
                <path d='M15 9h.01'></path>
                </svg>`"
      :options="[{ id: 0, nombre: 'Tipo de Inmueble' }, ...typesData]"
    />
  </div>

  <div class="col-span-2 md:col-span-1">
    <Select
      localStorage="ciudad"
      :svg="`<svg xmlns='http://www.w3.org/2000/svg'
                class='icon icon-tabler icon-tabler-map-pin' width='20' height='20' viewBox='0 0 24 24' stroke-width='2'
                stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'>
                <path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
                <path d='M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0'></path>
                <path d='M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z'></path>
                </svg>`"
      :options="[{ id: 0, nombre: 'Ubicación' }, ...locations]"
    />
  </div>

  <div class="col-span-2 md:col-span-1">
    <Select
      localStorage="barrio"
      :svg="`<svg xmlns='http://www.w3.org/2000/svg'
                class='icon icon-tabler icon-tabler-map-2' width='20' height='20' viewBox='0 0 24 24' stroke-width='2'
                stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'>
                <path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
                <path d='M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v7.5'></path>
                <path d='M9 4v13'></path>
                <path d='M15 7v5.5'></path>
                <path
                    d='M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879z'>
                </path>
                <path d='M19 18v.01'></path>
                </svg>`"
      :options="[{ id: 0, nombre: 'Sector' }, ...sectorData]"
      :isDisabled="isZoneDisabled"
    />
  </div>

  <div class="col-span-2">
    <RangeSlider />
  </div>

  <div class="col-span-2">
    <div class="grid grid-cols-1 md:grid-cols-3 md:gap-3 gap-y-3 w-full">
      <div>
        <Counter
          localStorage="alcobas"
          title="Habitaciones"
          svg="
                                <svg xmlns='http://www.w3.org/2000/svg' class='icon icon-tabler icon-tabler-bed' width='30' height='30' viewBox='0 0 24 24' stroke-width='1' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'>
                                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                                <path d='M7 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' />
                                <path d='M22 17v-3h-20' />
                                <path d='M2 8v9' />
                                <path d='M12 14h10v-2a3 3 0 0 0 -3 -3h-7v5z' />
                                </svg>
                                "
        />
      </div>

      <div>
        <Counter
          localStorage="banios"
          title="Baños"
          svg="
                            <svg xmlns='http://www.w3.org/2000/svg' class='icon icon-tabler icon-tabler-toilet-paper' width='30' height='30' viewBox='0 0 24 24' stroke-width='1' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'>
                                <path stroke='none' d='M0 0h24v24H0z' fill='none'/>
                                <path d='M6 10m-3 0a3 7 0 1 0 6 0a3 7 0 1 0 -6 0' /><path d='M21 10c0 -3.866 -1.343 -7 -3 -7' />
                                <path d='M6 3h12' />
                                <path d='M21 10v10l-3 -1l-3 2l-3 -3l-3 2v-10' />
                                <path d='M6 10h.01' />
                            </svg>
                                "
        />
      </div>
      <div>
        <Counter
          localStorage="garajes"
          title="Parqueaderos"
          svg="
                            <svg xmlns='http://www.w3.org/2000/svg' class='icon icon-tabler icon-tabler-parking-circle' width='30' height='30' viewBox='0 0 24 24' stroke-width='1' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'>
                                <path stroke='none' d='M0 0h24v24H0z' fill='none'/>
                                <path d='M10 16v-8h2.667c.736 0 1.333 .895 1.333 2s-.597 2 -1.333 2h-2.667' />
                                <path d='M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0' />
                            </svg>
                                "
        />
        <div class="mt-5 flex justify-end text-sm">
          <button
            type="button"
            class="hover:text-[--primary-color]"
            @click="deleteFilter"
          >
            Borrar filtros
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"

import Select from "./Select.vue"

import { useStore } from "@nanostores/vue"
import { filtros } from "../../store/filtroStore"
import { deleteFilter } from "../../store/filtroStore"

import RangeSlider from "./RangeSlider.vue"
import Counter from "./Counter.vue"

const $filtros = useStore(filtros)

const sectorData = ref([])
const typesData = ref([])
const locations = ref([])

const isZoneDisabled = ref(1)

// Función para obtener datos de la API de ciudades y tipos de inmuebles
const fetchData = async () => {
  try {
    const locationsAPI = await fetch(`/api/locations`)

    const typeProperty = await fetch(`/api/types`)

    locations.value = await locationsAPI.json()
    typesData.value = await typeProperty.json()
  } catch (error) {
    console.error("Error fetching data:", error)
  }
}

onMounted(async () => {
  await fetchData()
  const lStorage = JSON.parse(localStorage.getItem("filtros"))
  if (lStorage) {
    filtros.set(lStorage)
  }
})

// Manejar cambios en la selección de ciudad para obtener los sectores
watch(
  () => $filtros.value.ciudad,
  async (newValue) => {
    let url = `/api/zones`

    const queryParams = new URLSearchParams()
    queryParams.set("cityId", newValue)

    url += `?${queryParams.toString()}`

    const response = await fetch(url)

    sectorData.value = await response.json()

    if (newValue != 0) {
      isZoneDisabled.value = 0
    } else {
      isZoneDisabled.value = 1
    }
  },
)
</script>
