const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const generateToken = require('../config/generateToken')

module.exports.signup = async (req, res, next) => {
  try {
    const {
      fullName,
      username,
      email,
      password,
      identity,
      coursesEnrolledSplit: coursesEnrolled,
      coursesTeachSplit: coursesTeach,
    } = req.body
    const usernameCheck = await User.findOne({ username })
    const emailCheck = await User.findOne({ email })
    if (usernameCheck) {
      return res.json({ msg: 'Username already exists', status: false })
    }
    if (emailCheck) {
      return res.json({ msg: 'Email already exists', status: false })
    }
    const saltPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      fullName,
      username,
      email,
      password: saltPassword,
      identity,
      coursesEnrolled,
      coursesTeach,
    })
    delete user.password
    return res.json({ status: true, user })
  } catch (err) {
    next(err)
  }
}

module.exports.login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body
    const curruser = await User.findOne({ username })
    if (!curruser) {
      return res.json({ msg: 'Incorrect username or password.', status: false })
    }
    const emailCheck = await User.findOne({ email })
    if (!emailCheck) {
      return res.json({ msg: 'Incorrect email.', status: false })
    }
    const isPasswordValid = await bcrypt.compare(password, curruser.password)
    if (!isPasswordValid) {
      return res.json({ msg: 'Incorrect username or password.', status: false })
    }
    delete curruser.password
    console.log(curruser)
    return res.json({ status: true, curruser })
  } catch (err) {
    next(err)
  }
}

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id
    const avatarImage = req.body.image
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    )
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    })
  } catch (ex) {
    next(ex)
  }
}

module.exports.allUsers = async (req, res, next) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search } },
            { email: { $regex: req.query.search } },
          ],
        }
      : {}
    console.log(User.find(keyword))
    const data = JSON.parse(req.query.user)
    const users = await User.find(keyword).find({
      _id: { $ne: data._id },
    })
    return res.json(users)
  } catch (ex) {
    next(ex)
  }
}
