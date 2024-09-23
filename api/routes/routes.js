const router = require('express').Router()
const {register, profile, login, messages} = require('../controller/main.js')

router.route('/register').post(register)
router.route('/profile').get(profile)
router.route('/login').post(login)
router.route('/messages/:userId').get(messages)


module.exports = router