const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const {
  login,
  signup,
  getAllUsers,
  setAvatar,
  logOut,
} = require('../controllers/userController')
router.post('/signup', signup)
router.post('/login', login)

module.exports = router
