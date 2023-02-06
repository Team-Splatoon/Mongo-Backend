const express = require('express')
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
  autoCreateGroupChat,
  fetchGroupChats,
} = require('../controllers/chatController')

const router = express.Router()

// post : To send data to a server to create/update a resource.
// put : To send data to a server to create/update a resource.
// The difference between POST and PUT requests is that the latter are idempotent. This means that PUT requests have no additional effect if they are called multiple times.

// post controllers which are different callback functions to their corresponding routes, which will be used for the interaction between frontend and backend
router.route('/').post(accessChat)
router.route('/').get(fetchChats)
router.route('/group').post(createGroupChat)
router.route('/rename').put(renameGroup)
router.route('/groupremove').put(removeFromGroup)
router.route('/groupadd').put(addToGroup)
router.route('/autocreate').post(autoCreateGroupChat)
router.route('/fetchGroupChats').get(fetchGroupChats)

module.exports = router
