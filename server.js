const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const socket = require('socket.io')
const messageRoute = require('./routes/messagesRoute')
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
app.use('/api/messages', messageRoute)
app.use('/api/chat', chatRoute)
const server = app.listen(4000, () => console.log('server is up and running'))

const io = socket(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})

global.onlineUsers = new Map()

io.on('connection', (socket) => {
  global.chatSocket = socket
  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id)
  })

  socket.on('send-msg', (data) => {
    const sendUserSocket = onlineUsers.get(data.to)
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('msg-receive', data.msg)
    }
  })
})
