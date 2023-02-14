module.exports = {
  STATUS: {
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    COMPLETED: 'completed',
    CANCELED: 'canceled',
    PAID: 'paid',
  },

  SHIPPING_METHODS: {
    STANDARD: 'standard',
    PREMIUM: 'premium',
    EXPRESS: 'express',
  },

  SHIPPING_METHOD_DATA: {
    standard: {
      header: 'Standard shipping',
      sub_header: '$6.99 + $1.00 per item',
      shipping_method: 'standard',
    },
    premium: {
      header: 'Premium shipping',
      sub_header: '$12.99 + $4.00 per additional item',
      shipping_method: 'premium',
    },
    express: {
      header: 'Express shipping',
      sub_header: '$30.99 + $8.00 per additional item',
      shipping_method: 'express',
    },
  },
}
