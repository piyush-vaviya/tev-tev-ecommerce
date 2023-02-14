const mail = require('../utils/mail')

const { ECOMMERCE_URL } = process.env

const NOREPLY_EMAIL = 'john@monarcsoft.com'

module.exports.mailVerification = async (user) => {
  return mail().send({
    to: user.email,
    from: {
      email: NOREPLY_EMAIL,
      name: 'Nameon',
    },
    templateId: 'd-08cbb969583649ed87c14f57c7f97dee',
    dynamicTemplateData: {
      verifyUrl: `${ECOMMERCE_URL}/user/verify-email?t=${user.verification_token}`,
    },
  })
}

module.exports.mailResetPassword = async (user) => {
  return mail().send({
    to: user.email,
    from: {
      email: NOREPLY_EMAIL,
      name: 'Nameon',
    },
    templateId: 'd-b054690060904197839a833daf0cf10d',
    dynamicTemplateData: {
      resetUrl: `${ECOMMERCE_URL}/user/reset-password?t=${user.reset_token}`,
    },
  })
}
