import { atom } from "nanostores"

// Valores por defecto
const defaultValues = {
  ciudad: 0,
  barrio: 0,
  tipoInm: 0,
  tipOper: 1,
  valmin: 700000,
  valmax: 50000000,
  banios: 0,
  alcobas: 0,
  garajes: 0,
}

// Atom con los valores por defecto
export const filtros = atom(defaultValues)

export const deleteFilter = () => {
  // Establecer los valores por defecto en el atom
  filtros.set(defaultValues)
  // Eliminar el localStorage
  localStorage.removeItem("filtros")
}
