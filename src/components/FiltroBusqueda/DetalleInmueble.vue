<template>
  <div
    class="absolute inset-x-0 bottom-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
    aria-hidden="true"
  >
    <div
      class="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-red-200 to-[--primary-color] opacity-15 sm:right-[calc(50%-40rem)] sm:w-[72.1875rem]"
    ></div>
  </div>

  <div
    v-if="isLoading"
    class="w-full flex justify-center items-center min-h-screen"
  >
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

  <div class="pt-36 mx-10 lg:mx-40" v-else>
    <div v-if="data">
      <div
        class="uppercase font-bold text-4xl lg:text-5xl text-center bg-gradient-to-bl from-[--primary-color] to-red-950 text-transparent bg-clip-text"
      >
        <span>{{ data.oper + " " + data.tpinmu }}</span>
      </div>

      <div class="flex flex-wrap justify-center gap-4 mt-4 lg:text-xl">
        <div class="flex justify-center">
          <div
            class="flex bg-gradient-to-r from-[--primary-color] to-red-800 w-fit rounded-lg p-2 text-white items-center"
          >
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-map-pin-filled"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path
                  d="M18.364 4.636a9 9 0 0 1 .203 12.519l-.203 .21l-4.243 4.242a3 3 0 0 1 -4.097 .135l-.144 -.135l-4.244 -4.243a9 9 0 0 1 12.728 -12.728zm-6.364 3.364a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z"
                  stroke-width="0"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div class="ml-1">
              <span>{{
                data.ndepto + ", " + data.nciudad + ", " + data.NombreB
              }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <div
            class="flex bg-gradient-to-r from-[--primary-color] to-red-800 text-white p-2 rounded-lg items-center"
          >
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-currency-dollar"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="3"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path
                  d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2"
                />
                <path d="M12 3v3m0 12v3" />
              </svg>
            </div>
            <div class="ml-1">
              <span>{{ data.precio }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="h-fit mt-5" v-if="data.fotos && data.fotos.length > 0">
        <div
          class="relative h-[calc(100vh-7rem)] flex justify-center backdrop-blur-3xl rounded-lg overflow-hidden"
        >
          <img
            :src="data.fotos[displayedImage].foto"
            :key="displayedImage"
            alt=""
            class="w-full shadow-custom object-cover hover:cursor-pointer"
          />
        </div>

        <div
          class="grid grid-cols-6 gap-4 mt-3"
          v-if="data.fotos && data.fotos.length > 1"
        >
          <!-- Iterar solo sobre las primeras 6 imágenes -->
          <template
            v-for="(foto, index) in data.fotos.slice(0, 5)"
            :key="index"
          >
            <div class="h-32 w-full">
              <img
                class="w-full h-full rounded-lg object-cover transition-opacity duration-300 hover:shadow-custom hover:contrast-125 hover:cursor-pointer"
                :class="{
                  'contrast-125': displayedImage === index,
                  'shadow-custom': displayedImage === index,
                }"
                :src="foto.foto"
                @click="showPreview(index)"
                alt=""
              />
            </div>
          </template>

          <!-- Si hay más de 6 imágenes, mostrar la última imagen con el signo "+" y la cantidad de imágenes restantes -->
          <template v-if="data.fotos.length > 6">
            <div class="h-32 w-full relative" :key="data.fotos.length">
              <img
                class="w-full h-full rounded-lg object-cover transition-opacity duration-300 hover:shadow-custom hover:contrast-125 hover:cursor-pointer"
                :class="{
                  'contrast-125': displayedImage === data.fotos.length - 1,
                  'shadow-custom': displayedImage === data.fotos.length - 1,
                }"
                :src="data.fotos[data.fotos.length - 1].foto"
                @click="showPreview(data.fotos.length - 1)"
                alt=""
              />

              <!-- Texto "+" con la cantidad de imágenes restantes -->
              <div
                class="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 text-white font-bold rounded-lg hover:cursor-pointer hover:shadow-custom hover:bg-opacity-60"
                @click="showPreview(data.fotos.length - 1)"
              >
                +{{ data.fotos.length - 6 }}
              </div>
            </div>
          </template>
        </div>

        <div
          v-if="showPreviewImage"
          class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-90 z-50"
        >
          <div class="h-[calc(100vh-1rem)]">
            <div class="relative h-full">
              <button
                class="absolute top-0 right-0 m-4 p-1 rounded-full text-black backdrop-blur-lg hover:shadow-custom"
                @click="closePreviewImage"
              >
                <!-- Icono de cerrar -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-x"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <button
                class="absolute left-0 top-[50%] text-black ml-5 rounded-full backdrop-blur-lg"
                @click="previousImage"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-circle-arrow-left"
                  width="35"
                  height="35"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 21a9 9 0 1 0 0 -18a9 9 0 0 0 0 18" />
                  <path d="M8 12l4 4" />
                  <path d="M8 12h8" />
                  <path d="M12 8l-4 4" />
                </svg>
              </button>
              <button
                class="absolute right-0 top-[50%] text-black mr-5 rounded-full backdrop-blur-lg"
                @click="nextImage"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-circle-arrow-right"
                  width="35"
                  height="35"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0 -18" />
                  <path d="M16 12l-4 -4" />
                  <path d="M16 12h-8" />
                  <path d="M12 16l4 -4" />
                </svg>
              </button>
              <img
                :src="data.fotos[displayedImage].foto"
                :key="displayedImage"
                alt=""
                class="h-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <div class="text-lg">
          <div class="text-balance">
            <div class="text-[--primary-color] font-bold text-3xl">
              <span>Descripción General</span>
            </div>
            <hr class="my-5" />
            <div class="mt-4">
              <span>{{ data.descrip }}</span>
            </div>
          </div>

          <div class="text-balance mt-6">
            <div class="text-[--primary-color] font-bold text-3xl">
              <span>Detalles del Inmueble</span>
            </div>
            <hr class="my-5" />
            <div class="mt-4 flex flex-wrap w-full gap-y-4">
              <div class="flex flex-col w-1/2">
                <span class="block text-[--primary-color]">Localidad</span>
                <span>{{ data.localidad }}</span>
              </div>
              <div class="flex flex-col w-1/2">
                <span class="block text-[--primary-color]">Construido en</span>
                <span>{{ getYear() - data.EdadInmueble }}</span>
              </div>
              <div class="flex flex-col w-1/2">
                <span class="block text-[--primary-color]">Área del Lote</span>
                <span>{{ data.AreaLote + " m²" }}</span>
              </div>
              <div class="flex flex-col w-1/2">
                <span class="block text-[--primary-color]">Estrato</span>
                <span>{{ data.Estrato }}</span>
              </div>
            </div>
          </div>

          <div class="text-balance mt-6">
            <div class="text-[--primary-color] font-bold text-3xl">
              <span>Características</span>
            </div>
            <hr class="my-5" />
            <div class="mt-4 flex flex-wrap gap-4">
              <div
                class="card flex-grow h-fit px-3 py-1 border-2 border-[--primary-color-75] rounded-lg text-base lg:w-auto bg-white shadow-lg"
              >
                <div class="text-black">
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-key"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      stroke-width="1"
                      stroke="currentColor"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path
                        d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z"
                      ></path>
                      <path d="M15 9h.01"></path>
                    </svg>
                  </div>
                  <div>
                    <span>Código</span>
                  </div>
                  <div class="font-bold">
                    <span>{{ data.idInm }}</span>
                  </div>
                </div>
              </div>

              <div
                class="card flex-grow h-fit px-3 py-1 border-2 border-[--primary-color-75] rounded-lg text-base lg:w-auto bg-white shadow-lg"
              >
                <div class="text-black">
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-dimensions"
                      width="24"
                      height="24"
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
                  </div>
                  <div>
                    <span>Área Construida</span>
                  </div>
                  <div class="font-bold">
                    <span>{{ Math.round(data.AreaLote) + " m²" }}</span>
                  </div>
                </div>
              </div>

              <div
                class="card flex-grow h-fit px-3 py-1 border-2 border-[--primary-color-75] rounded-lg text-base lg:auto bg-white shadow-lg"
              >
                <div class="text-black">
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-bed"
                      width="24"
                      height="24"
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
                  </div>
                  <div>
                    <span>Habitaciones</span>
                  </div>
                  <div class="font-bold">
                    <span>{{ data.alcobas }}</span>
                  </div>
                </div>
              </div>
              <div
                class="card flex-grow h-fit px-3 py-1 border-2 border-[--primary-color-75] rounded-lg text-base lg:auto bg-white shadow-lg"
              >
                <div class="text-black">
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-toilet-paper"
                      width="24"
                      height="24"
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
                  </div>
                  <div>
                    <span>Baños</span>
                  </div>
                  <div class="font-bold">
                    <span>{{ data.banos }}</span>
                  </div>
                </div>
              </div>
              <div
                class="card flex-grow h-fit px-3 py-1 border-2 border-[--primary-color-75] rounded-lg text-base lg:auto bg-white shadow-lg"
              >
                <div class="text-black">
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-parking-circle"
                      width="24"
                      height="24"
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
                  </div>
                  <div>
                    <span>Parqueaderos</span>
                  </div>
                  <div class="font-bold">
                    <span>{{ data.garaje }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="text-balance mt-6">
            <div class="text-[--primary-color] font-bold text-3xl">
              <span>Características Interiores</span>
            </div>
            <hr class="my-5" />
            <div class="mt-4 flex flex-wrap w-full gap-4 justify-center">
              <template v-for="internas in data.caracteristicasInternas">
                <div
                  v-if="internas.mostrargrupo == 1"
                  class="bg-gradient-to-bl from-[--primary-color] to-red-800 shadow-lg text-white px-2 py-1 rounded-lg"
                >
                  <span>{{ internas.Descripcion }}</span>
                </div>
              </template>
            </div>
          </div>

          <div class="text-balance mt-6">
            <div class="text-[--primary-color] font-bold text-3xl">
              <span>Características Exteriores</span>
            </div>
            <hr class="my-5" />
            <div class="mt-4 flex flex-wrap w-full gap-4 justify-center">
              <template v-for="internas in data.caracteristicasExternas">
                <div
                  v-if="internas.mostrargrupo == 1"
                  class="bg-gradient-to-bl from-[--primary-color] to-red-800 shadow-lg text-white px-2 py-1 rounded-lg"
                >
                  <span>{{ internas.Descripcion }}</span>
                </div>
              </template>
            </div>
          </div>

          <div class="mt-6 text-balance text-base">
            <div class="flex justify-center mt-4">
              <div
                class="bg-gradient-to-bl from-[--primary-color] to-red-800 text-white w-full p-5 rounded-lg shadow-lg"
              >
                <div class="flex justify-between items-center gap-4">
                  <div class="flex flex-col">
                    <span class="text-2xl font-bold">{{
                      data.asesor[0].ntercero
                    }}</span>
                    <span class="text-lg">{{ data.asesor[0].nrol }}</span>
                    <a
                      :href="`https://api.whatsapp.com/send?phone=57${data.asesor[0].celular}&text=Hola%20estoy%20interesado%20en%20el%20inmueble%20${inmuebleId}`"
                      class="mt-3 bg-white rounded-lg text-[--primary-color] w-fit font-bold py-2 px-3 cursor-pointer hover:shadow-custom"
                      target="_blank"
                      >Contactar Asesor</a
                    >
                  </div>
                  <div
                    v-if="
                      data.asesor[0].FotoAsesor !=
                      `https://simicrm.app/mcomercialweb/`
                    "
                    class="max-w-40"
                  >
                    <img
                      :src="`https://portadainmobiliaria.com/asesores/${data.asesor[0].cedtercero}.png`"
                      class="rounded-full"
                      alt=""
                    />
                  </div>
                  <div v-else class="max-w-40">
                    <img
                      :src="`https://portadainmobiliaria.com/asesores/900336513.png`"
                      class="rounded-full"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

const isLoading = ref(true)
const inmuebleId = ref(null)
const data = ref(null)

let autoPlay = null

const displayedImage = ref(0)
const showPreviewImage = ref(false)

const showPreview = (index) => {
  if (index === data.value.fotos.length - 1) {
    showPreviewImage.value = true
    document.body.classList.add("overflow-hidden")
    clearInterval(autoPlay)
  } else {
    // Si no es la última imagen, cambiar la imagen normalmente
    changeImage(index)
  }
}

// Método para cerrar la vista previa de la imagen
const closePreviewImage = () => {
  showPreviewImage.value = false
  document.body.classList.remove("overflow-hidden")
}

const changeImage = (image) => {
  displayedImage.value = image
  clearInterval(autoPlay)
}

const nextImage = () => {
  if (data.value.fotos.length - 1 > displayedImage.value) {
    displayedImage.value += 1
  }
}

const previousImage = () => {
  if (
    data.value.fotos.length > displayedImage.value &&
    displayedImage.value > 0
  ) {
    displayedImage.value -= 1
  }
}

const getYear = () => {
  const today = new Date()
  const year = today.getFullYear()

  return year
}

onMounted(async () => {
  const pathSegments = window.location.pathname.split("/")
  inmuebleId.value = pathSegments[pathSegments.length - 1]

  let url = `/api/inmueble`

  const queryParams = new URLSearchParams()
  queryParams.set("inmueble", inmuebleId.value)

  url += `?${queryParams.toString()}`

  const response = await fetch(url)

  if (response.ok) {
    isLoading.value = false
  }

  data.value = await response.json()

  autoPlay = setInterval(() => {
    displayedImage.value = (displayedImage.value + 1) % data.value.fotos.length
  }, 4000)
})
</script>
