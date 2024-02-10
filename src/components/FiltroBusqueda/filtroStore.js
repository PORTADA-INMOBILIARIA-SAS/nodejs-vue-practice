import { atom } from "nanostores"

export const filtros = atom({
  ciudad: 0,
  barrio: 0,
  tipoInm: 0,
  tipOper: 1,
  valmin: 700000,
  valmax: 50000000,
  banios: 0,
  alcobas: 0,
  garajes: 0,
})
