const asyncHandler = require('express-async-handler')
const Chat = require('../models/chatModel')
const User = require('../models/userModel')

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body
  console.log(userId)
  const data = JSON.parse(req.query.user)

  if (!userId) {
    console.log('UserId param not sent with request')
    return res.sendStatus(400)
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: data._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage')

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'username avatarImage email',
  })

  if (isChat.length > 0) {
    res.send(isChat[0])
  } else {
    var chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [data._id, userId],
    }

    try {
      const createdChat = await Chat.create(chatData)
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password'
      )
      res.status(200).send(FullChat)
    } catch (error) {
      res.status(400)
      throw new Error(error.message)
    }
  }
})

//@description     Fetch all chats for a user
//@route           GET /api/chat/
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const data = JSON.parse(req.query.user)
    Chat.find({ users: { $elemMatch: { $eq: data._id } } })
      .populate('users', '-password')
      //.populate('users')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        console.log(results)
        results = await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'username avatarImage email',
        })
        res.status(200).send(results)
      })
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

//@description     Create New Group Chat
//@route           POST /api/chat/group
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'Please Fill all the fields' })
  }

  var users = JSON.parse(req.body.users)

  if (users.length < 2) {
    return res
      .status(400)
      .send('More than 2 users are required to form a group chat')
  }

  users.push(req.body.currUser)

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.body.currUser,
    })

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')

    res.status(200).json(fullGroupChat)
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

//@description     Auto Create New Group Chat
//@route           POST /api/chat/autocreate
const autoCreateGroupChat = asyncHandler(async (req, res) => {
  const users = [JSON.parse(req.body.users)]
  const groupNames = req.body.groupNames
  const currUser = req.body.currUser
  const currGroupChatExist = req.body.currGroupChatExist

  try {
    const newGroupChatCreatedList = []
    groupNames.map(async (name) => {
      for (var i = 0; i < currGroupChatExist.length; ++i) {
        if (name === currGroupChatExist[i].chatName) {
          if (currUser.identity === 'Staff') {
            await Chat.findByIdAndUpdate(
              currGroupChatExist[i]._id,
              { $push: { users: currUser._id }, groupAdmin: currUser },
              { new: true }
            )
              .populate('users', '-password')
              .populate('groupAdmin', '-password')
          } else {
            await Chat.findByIdAndUpdate(
              currGroupChatExist[i]._id,
              { $push: { users: currUser._id } },
              { new: true }
            )
              .populate('users', '-password')
              .populate('groupAdmin', '-password')
          }
        } else {
          if (currUser.identity === 'Staff') {
            const groupChat = await Chat.create({
              chatName: name,
              users: users,
              isGroupChat: true,
              groupAdmin: currUser,
            })
            const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
              .populate('users', '-password')
              .populate('groupAdmin', '-password')
            newGroupChatCreatedList.push(fullGroupChat)
          } else {
            const groupChat = await Chat.create({
              chatName: name,
              users: users,
              isGroupChat: true,
            })
            const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
              .populate('users', '-password')
              .populate('groupAdmin', '-password')
            newGroupChatCreatedList.push(fullGroupChat)
          }
        }
      }
    })

    res.status(200).json(newGroupChatCreatedList)
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

// @desc    Rename Group
// @route   PUT /api/chat/rename
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')

  if (!updatedChat) {
    res.status(404)
    throw new Error('Chat Not Found')
  } else {
    res.json(updatedChat)
  }
})

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')

  if (!removed) {
    res.status(404)
    throw new Error('Chat Not Found')
  } else {
    res.json(removed)
  }
})

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')

  if (!added) {
    res.status(404)
    throw new Error('Chat Not Found')
  } else {
    res.json(added)
  }
})

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  autoCreateGroupChat,
}
