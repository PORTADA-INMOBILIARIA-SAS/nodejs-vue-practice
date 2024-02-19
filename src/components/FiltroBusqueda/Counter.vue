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
          <span>{{ counterValue }}</span>
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
import { ref, onMounted, watch } from "vue"

import { useStore } from "@nanostores/vue"
import { filtros } from "../../store/filtroStore"

const $filtros = useStore(filtros)

const props = defineProps(["svg", "localStorage", "title"])

const localStorageKey = props.localStorage

const counterValue = ref(0)

const saveToFiltros = () => {
  filtros.set({
    ...filtros.value,
    [localStorageKey]: counterValue.value,
  })
}

const sumarCantidad = () => {
  if (counterValue.value < 5) {
    counterValue.value += 1
    saveToFiltros()
  }
}

watch(
  () => $filtros.value[props.localStorage],
  (newValue) => {
    counterValue.value = newValue
  },
)

const restarCantidad = () => {
  if (counterValue.value > 0) {
    counterValue.value -= 1
    saveToFiltros()
  }
}

onMounted(() => {
  counterValue.value = $filtros.value[props.localStorage]
})
</script>
