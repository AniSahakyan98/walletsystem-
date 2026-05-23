const express = require('express')
const controller = require('../controller/transferController')
const authMiddleware = require('../middleware/authMiddleware')
const Router = express.Router()

Router.get('/users',controller.getUserList)
Router.post('/login',controller.userLogin)
Router.post('/transfer', authMiddleware, controller.getBalances);



module.exports = Router

