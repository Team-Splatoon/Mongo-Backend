const asyncHandler = require('express-async-handler')
const Chat = require('../models/chatModel')
const User = require('../models/userModel')

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body
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

const fetchChats = asyncHandler(async (req, res) => {
  try {
    const data = JSON.parse(req.query.user)
    Chat.find({ users: { $elemMatch: { $eq: data._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
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

const fetchGroupChats = asyncHandler(async (req, res) => {
  try {
    const results = await Chat.find({ isGroupChat: true }).populate(
      'users',
      '-password'
    )
    res.status(200).send(results)
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

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

const autoCreateGroupChat = asyncHandler(async (req, res) => {
  const users = [JSON.parse(req.body.users)]
  const groupNames = req.body.groupNames
  const currUser = req.body.currUser
  const currGroupChatExist = req.body.currGroupChatExist

  try {
    const newGroupChatCreatedList = []
    for (var j = 0; j < groupNames.length; j++) {
      if (currGroupChatExist.length === 0) {
        if (currUser.identity === 'Staff') {
          const groupChat = await Chat.create({
            chatName: groupNames[j],
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
            chatName: groupNames[j],
            users: users,
            isGroupChat: true,
          })
          const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
          newGroupChatCreatedList.push(fullGroupChat)
        }
      } else {
        var created = false
        for (var i = 0; i < currGroupChatExist.length; i++) {
          if (groupNames[j] === currGroupChatExist[i].chatName) {
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
            created = true
          }
        }
        if (created === false) {
          if (currUser.identity === 'Staff') {
            const groupChat = await Chat.create({
              chatName: groupNames[j],
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
              chatName: groupNames[j],
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
    }
    res.status(200).json(newGroupChatCreatedList)
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

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

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body

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
  fetchGroupChats,
}
