const express = require('express')
const router = express.Router()

const {
  addMessage, 
  getAllMessage,
} = require('../controllers/messagesController')

router.post('/addmsg/', addMessage)
router.post('/getmsg/', getAllMessage)

// const {
//   allMessages, 
//   sendMessage,
// } = require('../controllers/messagesController')

// router.post('/addmsg/', sendMessage)
// router.get('/getmsg/', allMessages)

// const {
//   allMessages, sendMessage
// } = require('../controllers/messagesController')

// router.route('/:chatId').get(allMessages)
// router.route('/').post(sendMessage)

module.exports = router;
