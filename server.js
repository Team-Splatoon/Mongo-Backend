const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const socket = require('socket.io')
const messagesRoute = require('./routes/messagesRoute')
const userRoute = require('./routes/userRoute')
const chatRoute = require('./routes/chatRoute')

dotenv.config()

mongoose
  .connect(process.env.DATABASE_ACCESS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database connected'))
  .catch((err) => console.log(err.message))

// our server.js file needs to be aware of all the route.js files because server.js is where the listening happens. This is literally our server. So when a user sends a request to our application it gets to this file first, then the server.js sends that request to corresponding route.js files that have the router.post() which processes that post request and sends back a response.
app.use(express.json()) // this line of code we have activated body passer in our application
app.use(cors())
// All the routes imported from corresponding route.js file will be appended to the base path (e.g., '/api/auth')
app.use('/api/auth', userRoute)
app.use('/api/message', messagesRoute)
app.use('/api/chat', chatRoute)
// This app.listen() listens for all the requests coming from the frontend. So when it listens for a request and it sees a request, it's going to send that request to route.js
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
