export interface EntidadFinanciera {
  nombre: string
  tasaEA: number
  plazoMax: number
}

export const BANCOS_DEMO: EntidadFinanciera[] = [
  { nombre: "Bancolombia", tasaEA: 12.8, plazoMax: 20 },
  { nombre: "Davivienda", tasaEA: 12.5, plazoMax: 30 },
  { nombre: "BBVA", tasaEA: 13.1, plazoMax: 20 },
  { nombre: "Banco de Bogotá", tasaEA: 13.4, plazoMax: 20 },
]

export function formatoCOP(num: number): string {
  return "$" + Math.round(num).toLocaleString("es-CO")
}

export function calcularCuotaMensual(
  monto: number,
  tasaEA: number,
  anos: number,
): number {
  if (monto <= 0 || anos <= 0) return 0
  const meses = anos * 12
  // Conversión tasa E.A. a mensual efectiva: (1 + EA)^(1/12) - 1
  const tasaMes = Math.pow(1 + tasaEA / 100, 1 / 12) - 1
  if (tasaMes <= 0) return 0
  return (monto * tasaMes) / (1 - Math.pow(1 + tasaMes, -meses))
}

export function setupFinancingCalculator() {
  const radios = document.querySelectorAll<HTMLInputElement>(
    'input[name="modalidad"]',
  )
  const optionLabels = document.querySelectorAll<HTMLElement>(".tipo-opcion")

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      optionLabels.forEach((label) => {
        const r = label.querySelector<HTMLInputElement>(
          'input[name="modalidad"]',
        )
        if (r && r.checked) {
          label.classList.add("border-[#7a641a]")
          label.classList.remove("border-transparent")
        } else {
          label.classList.remove("border-[#7a641a]")
          label.classList.add("border-transparent")
        }
      })
      calcular()
    })
  })

  const valorInput = document.getElementById(
    "valor-vivienda",
  ) as HTMLInputElement | null
  const cuotaInput = document.getElementById(
    "cuota-inicial",
  ) as HTMLInputElement | null
  const plazoInput = document.getElementById(
    "plazo-anos",
  ) as HTMLInputElement | null
  const entidadSelect = document.getElementById(
    "entidad-bancaria",
  ) as HTMLSelectElement | null
  const montoInfo = document.getElementById("info-monto-prestamo")
  const cardsContainer = document.getElementById("cards-entidades")

  function calcular() {
    const valor = parseFloat(valorInput?.value || "0")
    const cuota = parseFloat(cuotaInput?.value || "0")
    const anos = parseFloat(plazoInput?.value || "20")
    const financiado = Math.max(0, valor - cuota)

    if (montoInfo) {
      montoInfo.textContent = `Monto a financiar: ${formatoCOP(financiado)}`
    }

    if (!cardsContainer) return

    cardsContainer.innerHTML = BANCOS_DEMO.map((banco) => {
      const cuotaMes = calcularCuotaMensual(financiado, banco.tasaEA, anos)
      const esSeleccionado = entidadSelect?.value === banco.nombre

      return `
        <div class="rounded-3xl border ${
          esSeleccionado
            ? "border-[#7a641a] bg-[#fffdf6]"
            : "border-[#e8e4dc] bg-white"
        } p-6 shadow-sm transition-all">
          <p class="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8a857b]">
            Financiación de vivienda
          </p>
          <h3 class="mt-2 text-[20px] font-medium text-[#1e1e24]">${banco.nombre}</h3>
          <div class="mt-5 space-y-2">
            <p class="text-[12.5px] text-[#6b6b75]">Cuota mensual aprox.</p>
            <p class="text-[24px] font-medium text-[#1e1e24]">${formatoCOP(cuotaMes)}</p>
          </div>
          <div class="mt-5 border-t border-[#f2eee6] pt-4 text-[12.5px] text-[#6b6b75] space-y-1">
            <p>Tasa ref: <span class="font-medium text-[#1e1e24]">${banco.tasaEA}% E.A.</span></p>
            <p>Plazo: <span class="font-medium text-[#1e1e24]">${anos} años</span></p>
          </div>
        </div>
      `
    }).join("")
  }

  const formCalc = document.getElementById("form-calculadora")
  formCalc?.addEventListener("submit", (e) => {
    e.preventDefault()
    calcular()
    document
      .getElementById("seccion-resultados")
      ?.scrollIntoView({ behavior: "smooth" })
  })

  valorInput?.addEventListener("input", calcular)
  cuotaInput?.addEventListener("input", calcular)
  plazoInput?.addEventListener("input", calcular)
  entidadSelect?.addEventListener("change", calcular)

  calcular()
}
