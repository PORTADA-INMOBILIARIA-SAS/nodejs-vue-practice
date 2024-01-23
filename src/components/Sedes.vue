<template>
  <div class="flex justify-center items-center mt-28 mb-20">
    <div class="line w-20 bg-red-600 h-1"></div>
    <span class="text-4xl font-bold ml-5 mr-5 text-center">Nuestras Sedes</span>
    <div class="line w-20 bg-red-600 h-1"></div>
  </div>

  <div class="grid grid-cols-2 mx-4 text-sm md:text-lg">
    <div class="col-start-1 col-end-2">
      <div class="w-[100%] bg-gray-900 text-white uppercase px-2 py-1">
        <span class="tracking-widest font-bold">ANTIOQUIA</span>
      </div>
      <div class="min-w-fit w-[95%] bg-gradient-to-r from-red-600 to-red-800 text-white uppercase px-2 py-1 mt-1 cursor-pointer transition-all duration-500 hover:shadow-custom hover:bg-red-800 hover:w-[97%]" v-on:click="sedeSeleccionada = 'laureles'">
        <span class="tracking-widest">Laureles</span>
      </div>
      <div class="min-w-fit w-[90%] bg-gradient-to-r from-red-600 to-red-800 text-white uppercase px-2 py-1 mt-1 cursor-pointer transition-all duration-500 hover:shadow-custom hover:bg-red-800 hover:w-[92%]" v-on:click="sedeSeleccionada = 'bello'">
        <span class="tracking-widest">Bello</span>
      </div>
      <div class="min-w-fit w-[85%] bg-gradient-to-r from-red-600 to-red-800 text-white uppercase px-2 py-1 mt-1 cursor-pointer transition-all duration-500 hover:shadow-custom hover:bg-red-800 hover:w-[87%]" v-on:click="sedeSeleccionada = 'colores'">
        <span class="tracking-widest">Los Colores</span>
      </div>
      <div class="min-w-fit w-[80%] bg-gradient-to-r from-red-600 to-red-800 text-white uppercase px-2 py-1 mt-1 cursor-pointer transition-all duration-500 hover:shadow-custom hover:bg-red-800 hover:w-[82%]" v-on:click="sedeSeleccionada = 'poblado'">
        <span class="tracking-widest">El Poblado</span>
      </div>
      <div class="min-w-fit w-[75%] bg-gradient-to-r from-red-600 to-red-800 text-white uppercase px-2 py-1 mt-1 cursor-pointer transition-all duration-500 hover:shadow-custom hover:bg-red-800 hover:w-[77%]" v-on:click="sedeSeleccionada = 'envigado'">
        <span class="tracking-widest">Envigado</span>
      </div>
      <div class="min-w-fit w-[70%] bg-gradient-to-r from-red-600 to-red-800 text-white uppercase px-2 py-1 mt-1 cursor-pointer transition-all duration-500 hover:shadow-custom hover:bg-red-800 hover:w-[72%]" v-on:click="sedeSeleccionada = 'sabaneta'">
        <span class="tracking-widest">Sabaneta</span>
      </div>
      <div class="min-w-fit w-[65%] bg-gradient-to-r from-red-600 to-red-800 text-white uppercase px-2 py-1 mt-1 cursor-pointer transition-all duration-500 hover:shadow-custom hover:bg-red-800 hover:w-[67%]" v-on:click="sedeSeleccionada = 'estrella'">
        <span class="tracking-widest">La Estrella</span>
      </div>
      <div class="min-w-fit w-[60%] bg-gradient-to-r from-red-600 to-red-800 text-white uppercase px-2 py-1 mt-1 cursor-pointer transition-all duration-500 hover:shadow-custom hover:bg-red-800 hover:w-[62%]" v-on:click="sedeSeleccionada = 'rionegro'">
        <span class="tracking-widest">Rionegro</span>
      </div>
      <div class="min-w-fit w-[55%] bg-gray-900 text-white uppercase px-2 py-1 mt-1">
        <span class="tracking-widest font-bold">Cundinamarca</span>
      </div>
      <div class="min-w-fit w-[65%] bg-gradient-to-r from-red-600 to-red-800 text-white uppercase px-2 py-1 mt-1 cursor-pointer transition-all duration-500 hover:shadow-custom hover:bg-red-800 hover:w-[67%]" v-on:click="sedeSeleccionada = 'bogota'">
        <span class="tracking-widest">Bogotá</span>
      </div>
      <div class="min-w-fit w-[70%] bg-gradient-to-r from-red-600 to-red-800 text-white uppercase px-2 py-1 mt-1 cursor-pointer transition-all duration-500 hover:shadow-custom hover:bg-red-800 hover:w-[72%]" v-on:click="sedeSeleccionada = 'mosquera'">
        <span class="tracking-widest">Mosquera</span>
      </div>
    </div>
    <div class="col-start-2 col-end-3 text-right">
      <transition name="fade" mode="out-in">
        <div class="flex flex-col h-[100%] justify-center items-end" v-bind:key="sedeSeleccionada">
          <div class="bg-gradient-to-r from-red-600 to-red-800 text-white px-2 py-1 w-auto">
              <span class="text-xl font-bold">
                  {{sedeSeleccionada == 'laureles' ? 'SEDE PRINCIPAL' : 'SEDE'}}
              </span>
          </div>
          <div class="mt-2">
            <span class="text-4xl md:text-7xl font-bold uppercase">{{infoSedes[sedeSeleccionada].nombre}}</span>
          </div>
          <div class="mt-5 text-lg">
          <span>{{infoSedes[sedeSeleccionada].telefono}}</span>
            <br>
            <span>{{infoSedes[sedeSeleccionada].direccion}}</span>
            <br>
            <span class="border-b-2 hover:border-b-red-600 cursor-pointer">Ver Asesores</span>
          </div>
          <div>
            <img src="/img/logo/logo-horizontal-portada.webp?url" alt="">
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sedeSeleccionada: 'laureles',
      infoSedes: {
        laureles: {
          nombre: 'Laureles',
          direccion: 'Carrera 81 # 35 - 96',
          telefono: '(604) 4487771 Opción 1, 1, 1'
        },
        bello: {
          nombre: 'Bello',
          direccion: 'Calle 26B # 49 - 104 Of 206',
          telefono: '(604) 4487771 Opción 1, 1, 1'
        },
        colores: {
          nombre: 'Los Colores',
          direccion: 'Calle 53 # 73 - 31',
          telefono: '(604) 4487771 Opción 1, 1, 1'
        },
        poblado: {
          nombre: 'El Poblado',
          direccion: 'Calle 10# 43D - 68 Local 2',
          telefono: '(604) 4487771 Opción 1, 1, 1'
        },
        envigado: {
          nombre: 'Envigado',
          direccion: 'Carrera 43A # 35 Sur - 15',
          telefono: '(604) 4487771 Opción 1, 1, 1'
        },
        sabaneta: {
          nombre: 'Sabaneta',
          direccion: 'Calle 70 Sur - 43A - 09',
          telefono: '(604) 4487771 Opción 1, 1, 1'
        },
        estrella: {
          nombre: 'La Estrella',
          direccion: 'Calle 75AA Sur # 53 - 198',
          telefono: '(604) 4487771 Opción 1, 1, 1'
        },
        rionegro: {
          nombre: 'Rionegro',
          direccion: 'Calle 47 # 62 - 18',
          telefono: '(604) 4487771 Opción 1, 1, 1'
        },
        bogota: {
          nombre: 'Fontibon',
          direccion: 'Calle 18 # 77 - 51 Local 212',
          telefono: '3009127843 Opción 1, 1, 2'
        },
        mosquera: {
          nombre: 'Mosquera',
          direccion: 'Carrera 3A # 17 Sur - 96 Local 114',
          telefono: '3009127843 Opción 1, 1, 2'
        }
      }
    };
  },
  methods: {
    handleSedeClick(sede) {
      this.sedeSeleccionada = sede;
    }
  }
};
</script>

<style>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .3s;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>