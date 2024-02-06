<template>
  <div>
    <div class="relative flex items-center w-full">
      <div class="absolute pl-2 text-[--primary-color]">
        <div v-html="svg"></div>
      </div>
      <select
        class="bg-white min-w-full shadow-custom rounded-md border-0 py-2 px-8 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-red-700 outline-none capitalize"
        @change="handleChange"
      >
        <option
          v-for="option in options"
          :value="Object.values(option)[0]"
          :key="option.id"
          class="capitalize"
        >
          {{ Object.values(option)[1] }}
        </option>
      </select>
      <div class="absolute text-[--primary-color] right-0 pr-3">
        <svg
          class="w-2.5 h-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 1 4 4 4-4"
          ></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { filtros } from "./filtroStore"

const props = defineProps(["svg", "localStorage", "options"])

const handleChange = (event) => {
  filtros.set({
    ...filtros.value,
    [props.localStorage]: parseInt(event.target.value),
  })
}
</script>
