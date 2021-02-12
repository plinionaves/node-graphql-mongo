const inputNameMap = {
  cardnumber: 'card_number',
  ccname: 'card_holder_name',
  'cc-exp': 'card_expiration_date',
  cvc: 'card_cvv',
}

window.addEventListener('load', () => {
  const output = document.querySelector('#output')
  const form = document.querySelector('#form')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const card = {}
    const { length } = Object.keys(inputNameMap)

    for (let i = 0; i < length; i++) {
      const input = form.elements[i]
      const field = inputNameMap[input.name]

      card[field] =
        field !== 'card_expiration_date'
          ? input.value
          : input.value.replace('/', '')
    }

    const validations = pagarme.validate({ card })
    const isValid = Object.keys(validations.card).every(
      (validationKey) => validations.card[validationKey],
    )

    if (isValid) {
      try {
        const client = await pagarme.client.connect({
          encryption_key: '<YOUR_ENCRYPTION_KEY>',
        })
        const cardHash = await client.security.encrypt(card)

        output.innerHTML = `
          <p>Card Hash:</p>
          <p>${cardHash}</p>
        `
        console.log('Card Hash: \n', cardHash)
      } catch (error) {
        alert('Erro ao gerar Card Hash')
        console.log('Error generating Card Hash:', error)
      }
    } else {
      alert('Dados do cartão são inválidos!')
      console.log('Invalid Card:', validations)
    }
  })
})
