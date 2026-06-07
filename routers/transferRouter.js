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
Router.post('/refund/:id',controller.refundFunction)
Router.get('/userInfo/:id',controller.getUserInfo)
Router.get('/analytics/:id', controller.summary)
Router.get('/filter', controller.dateFilter)
Router.get('/getBalance/:id', controller.getBalanceFromLedger)


module.exports = Router

