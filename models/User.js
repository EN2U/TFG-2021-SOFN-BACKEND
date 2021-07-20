const mongoose = require('mongoose')
const { Schema } = mongoose
const service = require('../services/service')
const bcrypt = require('bcrypt')

const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  return re.test(email)
}

const User = new Schema({
  userName: {
    type: String,
    required: [true, 'Please include an username...'],
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Please include your fullName...']
  },
  street: {
    type: String,
    required: [true, 'Please include a location...']
  },
  number: {
    type: Number,
    required: false
  },
  phone: {
    type: String,
    required: [true, 'Please include your phone...']
  },
  email: {
    type: String,
    required: [true, 'Please include your email...'],
    unique: true,
    validate: [validateEmail, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please include your password...'],
    minlength: 6
  },
  token: {
    type: String
  }
})

User.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  this.password = bcrypt.hashSync(this.password, 10)
  next()
})

User.methods.comparePassword = function (plaintext, callback) {
  return callback(null, bcrypt.compareSync(plaintext, this.password))
}

User.methods.generateToken = async function () {
  const user = this
  const token = service.createToken(user)
  user.token = token
  await user.save()

  return token
}

User.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email: email })
  if (!user) throw new Error({ status: 404, message: '[ERROR] Email not found...' })

  const isMatch = await bcrypt.compare(password, user.password)

  if (isMatch) return user
  else throw new Error({ status: 400, message: '[ERROR] Password doesnt match...' })
}
module.exports = mongoose.model('User', User)
