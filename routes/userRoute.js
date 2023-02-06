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
// Explaination: when a user is on /signup path, which means when a user is on the sign up page, and the user enter the required data they need to enter in the sign up form, when they click submit (handled by axios), a post request has been made. Now the post request is going to come to server.js and further come to this userRoute.js file, and router.post(..) will handle it. When router.post() handles it, it means the post function here will run, and everything (basically the callback function) inside the post function will also run.
router.post('/login', login)
router.post('/setavatar/:id', setAvatar)
router.get('/allusers', allUsers)

module.exports = router
