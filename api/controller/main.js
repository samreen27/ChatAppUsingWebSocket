const Message = require('../model/Message')
const User = require('../model/User')
const jwt = require('jsonwebtoken')


const register = async (req, res) => {

    try {
        const { username, password } = req.body
        const user = await User.create({ username, password })
        //const token = user.createJwt()

        jwt.sign({ userId: user._id, username: username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME }, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).status(201)
                .json({ msg: "User Created", id: user._id })
        })
    } catch (error) {
        //console.log(error.message)
        res.status(500).json({ msg: "Error Occurred" })
    }
}


const profile = async (req, res) => {
    try {
        const token = req.cookies?.token
        if (token) {

            jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
                if (err) throw err
                res.json(userData)
            })
        } else {
            res.status(401).json('no token')
        }
    } catch (error) {
        //console.log(error.message)
        res.status(500).json({ msg: "Error Occurred" })
    }

}

const login = async (req, res) => {

    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        if (!user) {
            res.status(400).json({ msg: "User doesnot exists" })
        }

        const isPasswordCorrect = user.comparePassword(password)

        if (!isPasswordCorrect) {
            res.status(400).json({ msg: "Invald Credentials" })
        }

        jwt.sign({ userId: user._id, username: username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME },
            (err, token) => {
                if (err) throw err;
                //console.log("token generated")
                res.cookie('token', token).status(201)
                    .json({ msg: "User Loggedin", id: user._id })
            })

    } catch (error) {
        res.status(500).json({ msg: "Error Occurred" })
    }

}

const messages = async (req, res) => {
    try {
        const { userId } = req.params
        const userData = await getUserDataFromRequest(req)
        const messages = await Message.find({
            sender: {$in: [userId, userData.userId]},
            recipient: {$in: [userId, userData.userId]}
        }).sort({createdAt:1})
        res.status(200).json(messages)
    } catch (error) { 
        res.status(500).json({ msg: "Error Occurred" })
    }

}

const getUserDataFromRequest = async (req) => {
    return new Promise((resolve, reject) => {
        const token = req.cookies?.token
        if (token) {

            jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
                if (err) throw err
                resolve(userData)
            })
        } else {
            reject('no token')
        }
    })

}

module.exports = { register, profile, login, messages }