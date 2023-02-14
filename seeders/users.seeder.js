const { Seeder } = require('mongoose-data-seed')
const { User } = require('../mongo/user')
const argon2 = require('argon2')
const mongoose = require('mongoose')

class UsersSeeder extends Seeder {
  async shouldRun () {
    return await User.countDocuments({}) === 0
  }

  async run () {
    return User.create({
      _id: mongoose.Types.ObjectId('5e8511fc41d00924b927511a'),
      email: 'marieto.ortillan@gmail.com',
      password: await argon2.hash('$tr0n5p@$$w0rd'),
      first_name: 'Super',
      last_name: 'Admin',
    })
  }
}

module.exports = UsersSeeder
