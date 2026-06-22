const mongoose = require('mongoose')
require('dotenv').config()

const cron = require('node-cron')
//const recurringTransfer = require('../controller/transferController')
const transfer = require('../services/transfer')
const Transaction = require('../models/transactionDetailsSchema')
const User = require('../models/usersSchema')
const RecurringTransfer = require('../models/recurringTransfer')


async function startCron() { 
try {
    await mongoose.connect(process.env.DB_URI)
    console.log("Script started... waiting for the cron job.");

await RecurringTransfer.create({
  fromUser: '6a25a8f47952b9feca6c0f1f',
  toUser: '6a25a95e7952b9feca6c0f20',
  amount: 800,
  frequency: "MONTHLY",
  nextRunAt: new Date(Date.now() - 10000),
  status: "ACTIVE"
})



cron.schedule("*/10 * * * * *", async() => {
    const dueTransfers = await RecurringTransfer.find({
        nextRunAt: {$lte: new Date()}
    })


    for(const item of dueTransfers) {
        const senderWallet= await User.findOne({ _id: item.fromUser })
        const senderWalletId = senderWallet.walletId
        const recipientWallet= await User.findOne({ _id: item.toUser })
        const recipientWalletId = recipientWallet.walletId
        await transfer.transferBalance(item.amount,senderWalletId,recipientWalletId)
    }
 })
} catch(error) {
    console.log("Error:", error)
  } 

}

//mongo i transactionnerum sort anel nayel oka te che verjnakan
startCron()
//fix day ov, hamel haskanal vonc testel sa

