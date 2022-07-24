const Messages = require('../models/messageModel')

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message, time, name} = req.body
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
      time: time,
      name: name,
    })
    //console.log(data)
    if (data) return res.json({ msg: 'Message added successfully.' })
    return res.json({ msg: 'Failed to add message to the database.' })
  } catch (ex) {
    next(ex)
  }
}

module.exports.getAllMessage = async (req, res, next) => {
  try {
    const { from, to } = req.body
    //console.log({ from, to })
    const messages = await Messages.find({
      users: {
        $all: [to],
      },
    }).sort({ updatedAt: 1 })
    const projectMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        time: msg.time,
        name: msg.name,
      }
    })
    console.log(projectMessages)
    res.json(projectMessages)
  } catch (ex) {
    next(ex)
  }
}

// const asyncHandler = require("express-async-handler");
// const Message = require("../models/messageModel");
// const User = require("../models/userModel");
// const Chat = require("../models/chatModel");

// //@description     Get all Messages
// //@route           GET /api/Message/:chatId
// //@access          Protected
// const allMessages = asyncHandler(async (req, res) => {
//   try {
//     const messages = await Message.find({ chat: req.params.chatId })
//       .populate('sender', 'username avatarImage email')
//       .populate('chat');
//     res.json(messages);
//   } catch (error) {
//     res.status(400);
//     throw new Error(error.message);
//   }
// });

// //@description     Create New Message
// //@route           POST /api/Message/
// //@access          Protected
// const sendMessage = asyncHandler(async (req, res) => {
//   const { content, chatId } = req.body;

//   if (!content || !chatId) {
//     console.log("Invalid data passed into request");
//     return res.sendStatus(400);
//   }

//   var newMessage = {
//     sender: req.user._id,
//     content: content,
//     chat: chatId,
//   };

//   try {
//     var message = await Message.create(newMessage)

//     message = await message.populate("sender", "name pic")
//     message = await message.populate("chat")
//     message = await User.populate(message, {
//       path: "chat.users",
//       select: 'username avatarImage email',
//     })

//     await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })

//     res.json(message)
//   } catch (error) {
//     res.status(400)
//     throw new Error(error.message)
//   }
// })

// module.exports = { allMessages, sendMessage }
