import './styles.css'

const checkFormValidity = formElement => formElement.checkValidity()

const getFormValues = formElement =>
  Object.values(formElement.elements)
    .filter(element => ['SELECT', 'INPUT'].includes(element.nodeName))
    .map(element => ({
      field: element.name,
      value: element.value,
    }))

const toStringFormValuesOutput = values => {
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

function handleTotalValuesUpdate() {
  const FTT = 6.38 / 100
  const INTEREST_RATE = 2.34 / 100
  const installments = document.getElementById('installments').value
  const NUMBER_OF_INSTALLMENTS = installments
  const VEHICLE_LOAN_AMOUNT = document.getElementById('loan-amount').value
  const totalPayable = Math.round(
    (FTT + INTEREST_RATE + NUMBER_OF_INSTALLMENTS / 1000 + 1) *
      VEHICLE_LOAN_AMOUNT,
  )
  const totalPayableFormatted = totalPayable.toLocaleString('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  })
  const montlyInstallment = Math.round(totalPayable / NUMBER_OF_INSTALLMENTS)

  const montlyInstallmentFormatted = montlyInstallment.toLocaleString('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  })

  document.getElementById('total-loan-value').innerHTML = totalPayableFormatted
  document.getElementById(
    'montly-loan-value',
  ).innerHTML = montlyInstallmentFormatted
}

function Send(values) {
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
    fetch('http://localhost:4000/api/question')
      .then(response => {
        return response.json()
      })
      .then(data => {
        alert(data.text)
      })
      .catch(error => alert(error.message))
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
      defautlValue: Number(29950.0),
    },
    house: {
      minValue: Number(50000.0),
      maxValue: Number(100000000.0),
      defautlValue: Number(2995000.0),
    },
  }

  const warranty = warrantyValues[collateralElement.value]
  const step = warranty.maxValue - warranty.minValue

  const minValueFormatted = warranty.minValue.toLocaleString('pt-BR', {
    currency: 'BRL',
  })

  const maxValueFormatted = warranty.maxValue.toLocaleString('pt-BR', {
    currency: 'BRL',
  })

  document.getElementById('min-warranty-value').innerHTML = minValueFormatted
  document.getElementById('max-warranty-value').innerHTML = maxValueFormatted
  document
    .getElementById('collateral-value')
    .setAttribute('value', warranty.defautlValue)
  warrantyRangeElement.addEventListener('change', event => {
    const rangeValue = Number(event.target.value)
    const increment = step / 100
    const collateralValue = increment * rangeValue + warranty.minValue
    collateralWarrantyElement.value = collateralValue

    handleChangeCollateralLoanAmount(
      document.getElementById('loan-amount-range'),
      document.getElementById('loan-amount'),
      document.getElementById('collateral'),
      collateralValue,
    )

    handleTotalValuesUpdate()
  })
}

function handleChangeCollateralLoanAmount(
  loanAmountRangeElement,
  loanAmountElement,
  collateralElement,
  collateralValue,
) {
  const loanAmount = {
    vehicle: {
      minValue: Number(3000.0),
      maxCollateralValue: Number(3000000.0),
    },
    house: {
      minValue: Number(30000.0),
      maxCollateralValue: Number(100000000.0),
    },
  }

  const loan = loanAmount[collateralElement.value]
  const maxValue = (collateralValue || loan.maxCollateralValue) * 0.8
  const increment = (maxValue - loan.minValue) / 100
  const displayRangeValue = maxValue - increment

  const minValueFormatted = loan.minValue.toLocaleString('pt-BR', {
    currency: 'BRL',
  })

  const maxValueFormatted = maxValue.toLocaleString('pt-BR', {
    currency: 'BRL',
  })

  document.getElementById('min-loan-value').innerHTML = minValueFormatted
  document.getElementById('max-loan-value').innerHTML = maxValueFormatted

  document.getElementById('loan-amount').value = displayRangeValue
  loanAmountRangeElement.addEventListener('change', event => {
    const rangeValue = Number(event.target.value)
    const collateralValue = increment * rangeValue + loan.minValue
    loanAmountElement.value = collateralValue
    handleTotalValuesUpdate()
  })
}

function handleChangeInstallmentsQuantity(installmentsAmountElements) {
  installmentsAmountElements.addEventListener('change', event => {
    handleTotalValuesUpdate()
  })
}

function initInstallmentOptions(installmentsElement) {
  const initVehicleOptions = ['24', '36', '48']
  initVehicleOptions.forEach((month, index) => {
    installmentsElement.add(new Option(month, month))
  })
}

function handleInstallmentsOptionsChange(collateralType) {
  const intallments = {
    vehicle: ['24', '36', '48'],
    house: ['120', '180', '240'],
  }

  const installmentsElement = document.getElementById('installments')
  removeSelectOptions(installmentsElement)

  intallments[collateralType].forEach((month, index) => {
    installmentsElement.add(new Option(month, month))
  })
  handleTotalValuesUpdate()
}

function removeSelectOptions(element) {
  for (let index = element.options.length; index > 0; index--) {
    element.remove(index - 1)
  }
}

function handleCollateralChange(
  warrantyRangeElement,
  collateralWarrantyElement,
  loanAmountRangeElement,
  loanAmountElement,
  collateralElement,
  collateralValue,
  installmentsElement,
) {
  collateralElement.addEventListener('change', event => {
    const collateralType = collateralElement.value

    handleChangeRangeCollateralUnderWarranty(
      warrantyRangeElement,
      collateralWarrantyElement,
      collateralElement,
    )

    handleChangeCollateralLoanAmount(
      loanAmountRangeElement,
      loanAmountElement,
      collateralElement,
      collateralValue,
    )

    handleInstallmentsOptionsChange(collateralType)

    handleTotalValuesUpdate()
  })
}

export default class CreditasChallenge {
  static initialize() {
    initInstallmentOptions(document.getElementById('installments'))

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

    handleChangeCollateralLoanAmount(
      document.getElementById('loan-amount-range'),
      document.getElementById('loan-amount'),
      document.getElementById('collateral'),
    )

    handleChangeInstallmentsQuantity(document.getElementById('installments'))

    handleTotalValuesUpdate()

    handleCollateralChange(
      document.getElementById('collateral-value-range'),
      document.getElementById('collateral-value'),
      document.getElementById('loan-amount-range'),
      document.getElementById('loan-amount'),
      document.getElementById('collateral'),
    )
  }
}

document.addEventListener('DOMContentLoaded', () => {
  CreditasChallenge.initialize()
})
