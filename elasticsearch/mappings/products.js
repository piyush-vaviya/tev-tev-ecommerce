#!/usr/bin/env node

const dotenv = require('dotenv')
dotenv.config()

const aws = require('../../utils/aws')
const APP_CONSTANTS = require('../../constants/app')

const MONGO_CONFIG = require('../../config/mongo')

const MONGO_CONNECTION_CONFIG = {
  host: process.env.MONGODB_HOST,
  dbName: process.env.MONGODB_NAME,
  username: process.env.MONGODB_USERNAME,
  password: process.env.MONGODB_PASSWORD,
  opts: MONGO_CONFIG.MONGOOSE_OPTS,
}

const settings = {
  mappings: {
    properties: {
      product_name: {
        search_analyzer: 'keyword_analyzer',
        type: 'text',
        analyzer: 'edge_ngram_analyzer',
      },
      product_description: {
        search_analyzer: 'keyword_analyzer',
        type: 'text',
        analyzer: 'edge_ngram_analyzer',
      },
      item_name: {
        search_analyzer: 'keyword_analyzer',
        type: 'text',
        analyzer: 'edge_ngram_analyzer',
      },
      product_tags: {
        search_analyzer: 'keyword_analyzer',
        type: 'text',
        analyzer: 'edge_ngram_analyzer',
      },
      product_categories: {
        search_analyzer: 'keyword_analyzer',
        type: 'text',
        analyzer: 'edge_ngram_analyzer',
      },
      product_colors: {
        search_analyzer: 'keyword_analyzer',
        type: 'text',
        analyzer: 'edge_ngram_analyzer',
      },
      product_sizes: {
        search_analyzer: 'keyword_analyzer',
        type: 'text',
        analyzer: 'edge_ngram_analyzer',
      },
    },
  },
  settings: {
    analysis: {
      filter: {
        english_poss_stemmer: {
          type: 'stemmer',
          name: 'possessive_english',
        },
        edge_ngram: {
          type: 'edgeNGram',
          min_gram: '2',
          max_gram: '10',
          token_chars: ['letter', 'digit'],
        },
      },
      analyzer: {
        edge_ngram_analyzer: {
          filter: ['lowercase', 'english_poss_stemmer', 'edge_ngram'],
          tokenizer: 'standard',
        },
        keyword_analyzer: {
          filter: ['lowercase', 'english_poss_stemmer'],
          tokenizer: 'standard',
        },
      },
    },
  },
}

const database = require('../../mongo')
database(MONGO_CONNECTION_CONFIG).then(async () => {
  await aws.ES.deleteIndex(APP_CONSTANTS.ELASTICSEARCH.PRODUCTS_INDEX)

  const res = await aws.ES.settings({
    indexName: APP_CONSTANTS.ELASTICSEARCH.PRODUCTS_INDEX,
    settings: settings,
  })

  console.log('Finished applying settings...')
  console.log(res)
}).catch(console.error)
