<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 my-14">
    <CardInmueble
      v-for="inmueble in inmuebles"
      :key="inmueble.code"
      :inmueble="inmueble"
    />
  </div>
</template>

<script>
import { ref, onMounted, watchEffect } from "vue"
import CardInmueble from "./CardInmueble.vue"
import { useStore } from "@nanostores/vue"
import { filtros } from "./filtroStore"

export default {
  components: {
    CardInmueble,
  },
  setup() {
    const inmuebles = ref([])
    // const filtro = ref(JSON.parse(localStorage.getItem('filtro')) || {});
    const $filtros = useStore(filtros)

    const fetchData = async () => {
      try {
        // Construye la URL de la API con los valores del filtro
        const apiUrl = `https://www.simi-api.com/ApiSimiweb/response/v2.1.1/filtroInmueble/limite/1/total/12/ciudad/0/barrio/0/tipoInm/0/tipOper/1/valmin/700000/valmax/500000000/campo/fecha/precio/0/order/desc/banios/${$filtros.value.banos || 0}/alcobas/${$filtros.value.habitaciones || 0}/garajes/${$filtros.value.parking || 0}/sede/0/usuario/0`

        // Realiza la solicitud HTTP para obtener la lista de inmuebles desde la API de Simiweb
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization:
              "Basic " +
              btoa(`Authorization:${import.meta.env.PUBLIC_SIMI_API_KEY}`),
          },
        })

        if (!response.ok) {
          throw new Error(
            `Error al obtener los inmuebles: ${response.statusText}`,
          )
        }

        const data = await response.json()

        // Actualiza la lista de inmuebles
        inmuebles.value = data.Inmuebles
      } catch (error) {
        console.error("Error:", error.message)
      }
    }

    onMounted(fetchData)

    // Observa los cambios en el objeto filtro y vuelve a realizar la consulta
    watchEffect(() => {
      fetchData()
    })

    return {
      inmuebles,
      filtros,
    }
  },
}
</script>
