const express = require('express')
const router = express.Router()
const {
  login,
  signup,
  allUsers,
  setAvatar,
} = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')

router.post('/signup', signup)
router.post('/login', login)
router.post('/setavatar/:id', setAvatar)
router.get('/allusers', protect, allUsers)

module.exports = router
