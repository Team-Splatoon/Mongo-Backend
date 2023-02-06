const mongoose = require('mongoose')

const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

const Chat = mongoose.model('Chat', chatModel)

// export the mongodb model which will later be used in chat controller
module.exports = Chat
