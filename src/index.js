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

export const handleTotalValuesUpdate = () => {
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

function handleChangeRangeCollateralUnderWarranty(
  warrantyRangeElement,
  collateralWarrantyElement,
  collateralElement,
) {
  const warrantyValues = {
    vehicle: {
      minValue: Number(5000.0),
      maxValue: Number(3000000.0),
    },
    house: {
      minValue: Number(50000.0),
      maxValue: Number(100000.0),
    },
  }

  const value = warrantyValues[collateralElement.value]
  const step = value.maxValue - value.minValue

  const minValueFormatted = value.minValue.toLocaleString('pt-BR', {
    currency: 'BRL',
  })

  const maxValueFormatted = value.maxValue.toLocaleString('pt-BR', {
    currency: 'BRL',
  })

  document.getElementById('min-warranty-value').innerHTML = minValueFormatted
  document.getElementById('max-warranty-value').innerHTML = maxValueFormatted

  warrantyRangeElement.addEventListener('change', event => {
    const rangeValue = Number(event.target.value)
    const increment = (value.maxValue - value.minValue) / 100
    const collateralValue = increment * rangeValue + value.minValue
    collateralWarrantyElement.value = collateralValue
    handleChangeVehicleLoanAmount(
      document.getElementById('loan-amount-range'),
      document.getElementById('loan-amount'),
      collateralValue,
    )
    handleTotalValuesUpdate()
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

  const minValueFormatted = MIN_VALUE.toLocaleString('pt-BR', {
    currency: 'BRL',
  })

  const maxValueFormatted = MAX_VALUE.toLocaleString('pt-BR', {
    currency: 'BRL',
  })

  document.getElementById('min-loan-value').innerHTML = minValueFormatted
  document.getElementById('max-loan-value').innerHTML = maxValueFormatted

  document.getElementById('loan-amount').value = displayRangeValue

  loanAmountRangeElement.addEventListener('change', event => {
    const rangeValue = Number(event.target.value)
    const collateralValue = increment * rangeValue + MIN_VALUE
    loanAmountElement.value = collateralValue
    handleTotalValuesUpdate()
  })
}

export function handleChangeInstallmentsQuantity(installmentsAmountElements) {
  installmentsAmountElements.addEventListener('change', event => {
    handleTotalValuesUpdate()
  })
}

export function handleCollateralChange(
  warrantyRangeElement,
  collateralWarrantyElement,
  collateralElement,
) {
  console.log(collateralElement)

  collateralElement.addEventListener('change', event => {
    const collateralType = collateralElement.value
    handleChangeRangeCollateralUnderWarranty(
      warrantyRangeElement,
      collateralWarrantyElement,
      collateralElement,
    )
    handleTotalValuesUpdate()
  })
}

export default class CreditasChallenge {
  static initialize() {
    this.registerEvents()
  }

  static registerEvents() {
    Submit(document.querySelector('.form'))
    Help(document.getElementById('help'))

    handleChangeRangeCollateralUnderWarranty(
      document.getElementById('collateral-value-range'),
      document.getElementById('collateral-value'),
      document.getElementById('collateral'),
    )

    handleChangeVehicleLoanAmount(
      document.getElementById('loan-amount-range'),
      document.getElementById('loan-amount'),
    )

    handleChangeInstallmentsQuantity(document.getElementById('installments'))

    handleTotalValuesUpdate()

    handleCollateralChange(
      document.getElementById('collateral-value-range'),
      document.getElementById('collateral-value'),
      document.getElementById('collateral'),
    )
  }
}

document.addEventListener('DOMContentLoaded', () => {
  CreditasChallenge.initialize()
})
