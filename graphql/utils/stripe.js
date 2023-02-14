const stripe = require('stripe')(process.env.STRIPE_API_KEY)

module.exports.createChargesPayment = async (amount, currency, description, source) => {
  return await stripe.charges.create({
    amount,
    currency,
    description,
    source,
  })
}

/** use for testing purposes only */
module.exports.createStripeCardToken = async () => {
  return await stripe.tokens.create(
    {
      card: {
        number: '4242424242424242',
        exp_month: 7,
        exp_year: 2021,
        cvc: '314',
      },
    },
  )
}

module.exports.stripe = stripe
