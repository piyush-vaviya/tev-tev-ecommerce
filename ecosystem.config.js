module.exports = {
  apps: [{
    name: 'core-api',
    script: './api-graphql-core/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '256M',
  }, {
    name: 'pickup-api',
    script: './api-graphql-pickup/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '256M',
  }, {
    name: 'ecommerce-api',
    script: './api-graphql-ecommerce/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '256M',
  }],
}
