import './styles.css'

export const checkFormValidity = formElement => formElement.checkValidity()

export const getFormValues = formElement =>
  Object.values(formElement.elements)
    .filter(element => ['SELECT', 'INPUT'].includes(element.nodeName))
    .map(element => ({
      field: element.name,
      value: element.value,
    }))

export const toStringFormValuesOutput = values => {
  const match = matchString => value => value.field === matchString
  const FTT = 6.38 / 100
  const INTEREST_RATE = 2.34 / 100
  const NUMBER_OF_INSTALLMENTS = values.find(match('installments')).value / 1000
  const VEHICLE_LOAN_AMOUNT = values.find(match('loan-amount')).value
  return `OUTPUT\n${values
    .map(value => `${value.field} --> ${value.value}`)
    .join('\n')}`.concat(
    `\nTotal ${
      (FTT + INTEREST_RATE + NUMBER_OF_INSTALLMENTS + 1) * VEHICLE_LOAN_AMOUNT
    }`,
  )
}

export const udpateTotalValues = () => {
  const FTT = 6.38 / 100
  const INTEREST_RATE = 2.34 / 100
  const installments = document.getElementById('installments').value
  const NUMBER_OF_INSTALLMENTS = installments / 1000
  const VEHICLE_LOAN_AMOUNT = document.getElementById('loan-amount').value

  const totalPayable = Math.floor(
    (FTT + INTEREST_RATE + NUMBER_OF_INSTALLMENTS + 1) * VEHICLE_LOAN_AMOUNT,
  )
  const totalPayableFormatted = totalPayable.toLocaleString('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  })
  const montlyInstallment = Math.floor(totalPayable / NUMBER_OF_INSTALLMENTS)
  const montlyInstallmentFormatted = montlyInstallment.toLocaleString('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  })

  document.getElementById('total-loan-value').innerHTML = totalPayableFormatted
  document.getElementById(
    'montly-loan-value',
  ).innerHTML = montlyInstallmentFormatted
}

export function Send(values) {
  return new Promise((resolve, reject) => {
    try {
      resolve(toStringFormValuesOutput(values))
    } catch (error) {
      reject(error)
    }
  })
}

export function Submit(formElement) {
  formElement.addEventListener('submit', event => {
    event.preventDefault()
    if (checkFormValidity(formElement)) {
      Send(getFormValues(formElement))
        .then(result => confirm(result, 'Your form submited success'))
        .catch(error => Alert('Your form submited error', error))
    }
  })
}

export function Help(element) {
  element.addEventListener('click', event => {
    alert('Display here the help text')
  })
}

export function handleChangeRangeVehicleUnderWarranty(
  warrantyRangeElement,
  vehicleWarrantyElement,
) {
  const MIN_VALUE = Number(5000.0)
  const MAX_VALUE = Number(3000000.0)
  const STEP = MAX_VALUE - MIN_VALUE

  document.getElementById('min-warranty-value').innerHTML = MIN_VALUE
  document.getElementById('max-warranty-value').innerHTML = MAX_VALUE

  warrantyRangeElement.addEventListener('change', event => {
    const rangeValue = Number(event.target.value)
    const increment = (MAX_VALUE - MIN_VALUE) / 100
    const collateralValue = increment * rangeValue + MIN_VALUE
    vehicleWarrantyElement.value = collateralValue
    handleChangeVehicleLoanAmount(
      document.getElementById('loan-amount-range'),
      document.getElementById('loan-amount'),
      collateralValue,
    )
    udpateTotalValues()
  })
}

export function handleChangeVehicleLoanAmount(
  loanAmountRangeElement,
  loanAmountElement,
  collateralValue,
) {
  const MIN_VALUE = Number(3000.0)
  const MAX_VALUE = (collateralValue || Number(3000000.0)) * 0.8
  const increment = (MAX_VALUE - MIN_VALUE) / 100
  const displayRangeValue = MAX_VALUE - increment
  document.getElementById('min-loan-value').innerHTML = MIN_VALUE
  document.getElementById('max-loan-value').innerHTML = MAX_VALUE
  document.getElementById('loan-amount').value = displayRangeValue

  loanAmountRangeElement.addEventListener('change', event => {
    const rangeValue = Number(event.target.value)
    const collateralValue = increment * rangeValue + MIN_VALUE
    loanAmountElement.value = collateralValue
    udpateTotalValues()
  })
}

export function handleChangeInstallmentsQuantity(installmentsAmountElements) {
  installmentsAmountElements.addEventListener('change', event => {
    udpateTotalValues()
  })
}

export default class CreditasChallenge {
  static initialize() {
    this.registerEvents()
  }

  static registerEvents() {
    Submit(document.querySelector('.form'))
    Help(document.getElementById('help'))

    handleChangeRangeVehicleUnderWarranty(
      document.getElementById('collateral-value-range'),
      document.getElementById('collateral-value'),
    )

    handleChangeVehicleLoanAmount(
      document.getElementById('loan-amount-range'),
      document.getElementById('loan-amount'),
    )

    handleChangeInstallmentsQuantity(document.getElementById('installments'))
  }
}

document.addEventListener('DOMContentLoaded', () => {
  CreditasChallenge.initialize()
})
