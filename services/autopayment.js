require('dotenv').config();
const RecurringTransferModel = require('../models/recurringTransfer')
const User = require('../models/usersSchema')
const transfer = require('./transfer')
const stripe = require('./stripe');


const autopaymentConfig = (async(sender,recipient,frequency,amount) => { //sent,recipient,frequency,amount
    const date = new Date()
    let nextRunAt;
    const senderObj = await User.findOne({walletId: sender})
    const senderId = senderObj._id
    const recipientObj = await User.findOne({walletId: recipient})
    const recipientId = recipientObj._id 

    if(frequency === "MONTHLY") {
        const month = date.getMonth() + 1
        nextRunAt = new Date(date.getFullYear(),month,date.getDate()) 
        
    } else if (frequency === "ANUALLY") {
        const year = date.getFullYear() + 1
        nextRunAt = new Date(year,date.getMonth(),date.getDate())
    } 

    const recurringTransfer = new RecurringTransferModel({
         fromUser: senderId,
         toUser: recipientId,
         frequency,
         amount,
         nextRunAt
        })
    recurringTransfer.save()
    return {}
})


module.exports = {
    autopaymentConfig
}