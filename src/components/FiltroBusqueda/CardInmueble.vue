<template>
  <div
    class="h-[550px] w-full rounded-md overflow-hidden shadow-custom bg-white apt-card cursor-pointer"
  >
    <div class="h-[70%] w-full relative text-center overflow-hidden">
      <div
        class="absolute bg-[--primary-color] text-white px-2 py-2 text-xl rounded-br-md z-10"
      >
        <span>{{ inmueble.Codigo_Inmueble }}</span>
      </div>
      <div
        class="absolute right-0 bg-[--primary-color] text-white px-2 py-2 text-xl rounded-bl-md heart-container cursor-pointer z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon icon-tabler icon-tabler-heart heart"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="hidden icon icon-tabler icon-tabler-heart-filled heart-filled"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z"
            stroke-width="0"
            fill="currentColor"
          />
        </svg>
      </div>
      <div
        class="absolute bottom-0 w-full bg-[--primary-color] text-white px-2 py-2 text-xl rounded-bl-md z-10"
      >
        <span>$ {{ inmueble.valorFiltro }}</span>
      </div>
      <img
        :src="`${inmueble.foto1}`"
        class="h-full w-full object-cover z-0"
        alt=""
      />
    </div>
    <div class="p-3 font-bold text-center">
      <div class="mb-4 md:text-xl">
        <span>{{
          inmueble.Tipo_Inmueble +
          " en " +
          inmueble.Ciudad +
          " " +
          inmueble.Departamento +
          ", Barrio " +
          inmueble.Barrio
        }}</span>
      </div>
      <div
        class="flex text-base font-light h-20 w-full justify-center items-center text-center gap-4 pb-3"
      >
        <div class="flex flex-col">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon icon-tabler icon-tabler-dimensions"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            stroke-width="1"
            stroke="currentColor"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 5h11" />
            <path d="M12 7l2 -2l-2 -2" />
            <path d="M5 3l-2 2l2 2" />
            <path d="M19 10v11" />
            <path d="M17 19l2 2l2 -2" />
            <path d="M21 12l-2 -2l-2 2" />
            <path
              d="M3 10m0 2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v7a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2z"
            />
          </svg>
          <span>{{ inmueble.AreaLote }} m²</span>
        </div>

        <div class="flex flex-col h-full w-[2px] bg-gray-200"></div>

        <div class="flex flex-col">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon icon-tabler icon-tabler-bed"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            stroke-width="1"
            stroke="currentColor"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M7 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <path d="M22 17v-3h-20" />
            <path d="M2 8v9" />
            <path d="M12 14h10v-2a3 3 0 0 0 -3 -3h-7v5z" />
          </svg>
          <span>{{ inmueble.Alcobas }}</span>
        </div>

        <div class="flex flex-col h-full w-[2px] bg-gray-200"></div>

        <div class="flex flex-col">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon icon-tabler icon-tabler-toilet-paper"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            stroke-width="1"
            stroke="currentColor"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M6 10m-3 0a3 7 0 1 0 6 0a3 7 0 1 0 -6 0" />
            <path d="M21 10c0 -3.866 -1.343 -7 -3 -7" />
            <path d="M6 3h12" />
            <path d="M21 10v10l-3 -1l-3 2l-3 -3l-3 2v-10" />
            <path d="M6 10h.01" />
          </svg>
          <span>{{ inmueble.banios }}</span>
        </div>

        <div class="flex flex-col h-full w-[2px] bg-gray-200"></div>

        <div class="flex flex-col">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon icon-tabler icon-tabler-parking-circle"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            stroke-width="1"
            stroke="currentColor"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path
              d="M10 16v-8h2.667c.736 0 1.333 .895 1.333 2s-.597 2 -1.333 2h-2.667"
            />
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
          </svg>
          <span>{{ inmueble.garaje }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  inmueble: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.heart-container:hover .heart {
  display: none;
}

.heart-container:hover .heart-filled {
  display: block;
}

.apt-card img {
  transition: all 0.3s ease;
}

.apt-card:hover img {
  transition: all 0.3s ease;
  scale: 110%;
}
</style>
