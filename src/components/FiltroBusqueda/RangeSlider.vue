<template>
  <div
    class="flex w-[70%] sm:w-[90%] m-auto items-center h-fit justify-center my-8"
  >
    <div class="py-1 relative min-w-full" ref="containerRef">
      <div class="h-2 bg-gray-200 rounded-full">
        <div
          class="absolute h-2 rounded-full bg-[--primary-color]"
          :style="{ width: rangeWidth, left: rangeLeft }"
        ></div>

        <!-- Input de Rango Mínimo -->
        <input type="range" v-model="minPrice" class="invisible" />

        <!-- Boton minimo -->
        <div
          class="absolute h-4 flex items-center justify-center w-4 rounded-full bg-white shadow border border-gray-300 -ml-2 top-0 cursor-pointer"
          unselectable="on"
          @mousedown="handleStart('min')"
          @mouseup="handleEnd"
          @touchstart="handleStart('min')"
          @touchend="handleEnd"
          :style="{ left: rangeLeft }"
        >
          <div class="relative -mt-2 w-fit h-fit flex">
            <div class="relative shadow-md">
              <div
                class="bg-black -mt-8 text-white truncate text-xs rounded py-1 px-2"
              >
                {{ formatCurrency(minPrice) }}
              </div>
              <svg
                class="absolute text-black w-full h-2 left-0 top-100"
                x="0px"
                y="0px"
                viewBox="0 0 255 255"
                xml:space="preserve"
              >
                <polygon
                  class="fill-current"
                  points="0,0 127.5,127.5 255,0"
                ></polygon>
              </svg>
            </div>
          </div>
        </div>

        <!-- Input de Rango Máximo -->
        <input type="range" v-model="maxPrice" class="invisible" />

        <!-- Boton maximo -->
        <div
          class="absolute h-4 flex items-center justify-center w-4 rounded-full bg-white shadow border border-gray-300 -ml-2 top-0 cursor-pointer"
          unselectable="on"
          @mousedown="handleStart('max')"
          @mouseup="handleEnd"
          @touchstart="handleStart('max')"
          @touchend="handleEnd"
          :style="{ left: rangeRight }"
        >
          <div class="relative -mt-2 w-fit h-fit flex">
            <div class="relative shadow-md">
              <div
                class="bg-black -mt-8 text-white truncate text-xs rounded py-1 px-2"
              >
                {{ formatCurrency(maxPrice) }}
              </div>
              <svg
                class="absolute text-black w-full h-2 left-0 top-100"
                x="0px"
                y="0px"
                viewBox="0 0 255 255"
                xml:space="preserve"
              >
                <polygon
                  class="fill-current"
                  points="0,0 127.5,127.5 255,0"
                ></polygon>
              </svg>
            </div>
          </div>
        </div>
        <div class="absolute -ml-1 bottom-0 left-0 -mb-6">Min</div>
        <div class="absolute -mr-1 bottom-0 right-0 -mb-6">Max</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue"

import { useStore } from "@nanostores/vue"
import { filtros } from "./filtroStore"
const $filtros = useStore(filtros)

const min = ref(700000)
const max = ref(50000000)
const minPrice = ref(min.value)
const maxPrice = ref(max.value)
const isDragging = ref(false)
const containerRef = ref(null)

const rangeWidth = computed(
  () =>
    `${((maxPrice.value - minPrice.value) / (max.value - min.value)) * 100}%`,
)
const rangeLeft = computed(
  () => `${((minPrice.value - min.value) / (max.value - min.value)) * 100}%`,
)
const rangeRight = computed(
  () => `${((maxPrice.value - min.value) / (max.value - min.value)) * 100}%`,
)

const formatCurrency = (value) =>
  `$ ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`

const handleStart = (type) => {
  isDragging.value = type
}

const handleEnd = () => {
  isDragging.value = false
  filtros.set({
    ...filtros.value,
    ["valmin"]: minPrice.value,
    ["valmax"]: maxPrice.value,
  })
}

const handleMove = (event) => {
  if (isDragging.value) {
    const rect = containerRef.value.getBoundingClientRect()
    const percentage =
      (event.touches ? event.touches[0].clientX : event.clientX - rect.left) /
      rect.width
    const price =
      min.value +
      Math.round(((max.value - min.value) * percentage) / 50000) * 50000

    if (isDragging.value === "min") {
      if (price >= min.value && price <= max.value) {
        minPrice.value = Math.min(price, maxPrice.value)
      } else {
        minPrice.value = min.value
      }
    } else if (isDragging.value === "max") {
      if (price >= min.value && price <= max.value) {
        maxPrice.value = Math.max(price, minPrice.value)
      } else {
        maxPrice.value = max.value
      }
    }
  }
}

onMounted(() => {
  window.addEventListener("mousemove", handleMove)
  window.addEventListener("mouseup", handleEnd)
  window.addEventListener("touchmove", handleMove)
  window.addEventListener("touchend", handleEnd)
})

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMove)
  window.removeEventListener("mouseup", handleEnd)
  window.removeEventListener("touchmove", handleMove)
  window.removeEventListener("touchend", handleEnd)
})

watch(
  () => $filtros.value.gestion,
  (newValue) => {
    if (newValue === 5) {
      min.value = 100000000
      minPrice.value = 100000000
      maxPrice.value = 2000000000
      max.value = 2000000000
    } else if (newValue === 1) {
      min.value = 700000
      minPrice.value = 700000
      max.value = 50000000
      maxPrice.value = 50000000
    }
  },
)
</script>
