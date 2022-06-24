const mongoose = require('mongoose')

const userTemplate = new mongoose.Schema({
  fullName: {
    type: String,
    requred: true,
    min: 3,
    max: 20,
  },
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 8,
    max: 50,
  },
  identity: {
    type: String,
    min: 8,
    max: 50,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  coursesEnrolled: {
    type: Array,
    required: true,
  },
  coursesTeach: {
    type: Array,
    required: true,
  },
  isAvatarImageSet: {
    type: Boolean,
    default: false,
  },
  avatarImage: {
    type: String,
    default: '',
  },
})

module.exports = mongoose.model('Usertable', userTemplate)
