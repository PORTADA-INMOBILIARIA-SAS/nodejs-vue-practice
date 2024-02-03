<template>
  <div class="flex justify-center">
    <div
      class="flex bg-white shadow-custom items-center rounded-md w-full justify-between"
    >
      <div class="flex items-center ml-3">
        <div v-html="svg"></div>
        <span class="pl-2">{{ title }}</span>
      </div>
      <div class="flex items-center">
        <div class="h-[50px] w-[1px] bg-gray-300"></div>
        <div class="px-4">
          <span>{{ filtro.localStorageKey }}</span>
        </div>
        <div class="h-[50px] w-[1px] bg-gray-300"></div>
        <div class="flex flex-col text-center">
          <div class="hover:text-[--primary-color]">
            <button type="button" class="px-2 text-xl" @click="sumarCantidad">
              +
            </button>
          </div>
          <div class="hover:text-[--primary-color]">
            <button
              type="button"
              class="px-2 font-bold"
              @click="restarCantidad"
            >
              —
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { filtros } from "./filtroStore"

const props = defineProps(["svg", "localStorage", "title"])

const localStorageKey = props.localStorage

const filtro = ref({
  localStorageKey: 0,
})

const getInitialFiltro = () => {
  return {
    localStorageKey: filtros[localStorageKey] || 0,
  }
}

const saveToFiltros = () => {
  filtros.set({
    ...filtros.value,
    [localStorageKey]: filtro.value.localStorageKey,
  })
}

const sumarCantidad = () => {
  if (filtro.value.localStorageKey < 5) {
    filtro.value.localStorageKey += 1
    saveToFiltros()
  }
}

const restarCantidad = () => {
  if (filtro.value.localStorageKey > 0) {
    filtro.value.localStorageKey -= 1
    saveToFiltros()
  }
}

onMounted(() => {
  Object.assign(filtro.value, getInitialFiltro())
})
</script>
