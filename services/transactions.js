const { PaymentTransaction } = require('../mongo/paymentTransaction')

module.exports.PaymentTransaction = async (transactionInputs) => {
  const transaction = await PaymentTransaction.create(transactionInputs)
  return transaction
}
