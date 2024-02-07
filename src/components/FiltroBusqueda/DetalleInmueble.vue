<template>
  <div class="pt-32">
    <h1>{{ inmuebleId }}</h1>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

const inmuebleId = ref(null)

onMounted(() => {
  const pathSegments = window.location.pathname.split("/")
  inmuebleId.value = pathSegments[pathSegments.length - 1]
  console.log(inmuebleId.value)
})
</script>
