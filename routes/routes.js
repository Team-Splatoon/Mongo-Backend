const express = require('express')
const router = express.Router()

const {
  login,
  signup,
  getAllUsers,
  setAvatar,
  logOut,
} = require('../controllers/userController')
router.post('/signup', signup)
router.post('/login', login)
router.post('/setavatar/:id', setAvatar)

module.exports = router
