const express = require('express')
const controller = require('../controller/transferController')
const stripeController = require('../controller/stripeController')
const authMiddleware = require('../middleware/authMiddleware')
const Router = express.Router()

Router.get('/transactionHistory/:id',controller.getTransactions)
Router.get('/users',controller.getUserList)
Router.post('/login',controller.userLogin)
Router.post('/transfer', authMiddleware, controller.transactionBalanceController);
Router.post('/wallet/topUp',authMiddleware,controller.topUp)
Router.post('/stripe/webhook',stripeController.webhookController)


module.exports = Router

