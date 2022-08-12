const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const socket = require('socket.io')
const messagesRoute = require('./routes/messagesRoute')
const routesUrls = require('./routes/userRoute')
const chatRoute = require('./routes/chatRoute')

dotenv.config()

mongoose
  .connect(process.env.DATABASE_ACCESS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database connected'))
  .catch((err) => console.log(err.message))

app.use(express.json())
app.use(cors())
app.use('/api/auth', routesUrls)
app.use('/api/message', messagesRoute)
app.use('/api/chat', chatRoute)
const server = app.listen(4000, () => console.log('server is up and running'))

const io = socket(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  global.chatSocket = socket
  socket.on('setup', (userData) => {
    socket.join(userData._id)
  })

  socket.on('join_chat', (room) => {
    socket.join(room)
  })

  socket.on('send_msg', (newMessageRecieved) => {
    var chat = newMessageRecieved.chat

    if (!chat.users) return console.log('chat.users not defined')

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.from) return

      socket
        .in(user._id)
        .emit('msg_recieve', JSON.stringify(newMessageRecieved))
    })
  })

  socket.on('disconnect', () => {
    console.log('disconnect')
  })

  socket.off('setup', () => {
    console.log('USER DISCONNECTED')
    socket.leave(userData._id)
  })
})
