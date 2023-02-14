const amqplib = require('amqplib')
const async = require('async')

const { APP_ENV } = process.env

if (!APP_ENV) throw new Error('APP_ENV is not set at .env file!')

function connect () {
  return amqplib.connect(process.env.AMQP_URL)
}

function getQueueNameByEnvironment (queueName) {
  return `${queueName}-${APP_ENV}`
}

module.exports.publish = async function (queue, dataString) {
  const q = getQueueNameByEnvironment(queue)
  console.log(q)
  const conn = await connect()
  const channel = await conn.createChannel()
  await channel.assertQueue(q)
  await channel.sendToQueue(q, Buffer.from(dataString))
  await channel.close()
  await conn.close()
}

module.exports.batchPublish = async function (arrayOfObject = []) {
  const conn = await connect()
  const channel = await conn.createChannel()

  await async.eachSeries(arrayOfObject, async (config) => {
    const q = getQueueNameByEnvironment(config.queue)

    await channel.assertQueue(q)
    await channel.sendToQueue(q, Buffer.from(config.payload))
  })

  await channel.close()
  await conn.close()
}

module.exports.connect = connect
