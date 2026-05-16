const express = require('express')
const controller = require('../controller/transferController')
const Router = express.Router()

Router.get('/users',controller.getUserList)
Router.post('/transfer/:id',controller.getBalances)




module.exports = Router

