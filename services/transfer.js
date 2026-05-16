const Transaction = require('../models/transactionDetailsSchema')
const User = require('../models/usersSchema')


const getUsersList = (async() => {
    const list = await User.find()
    return list
})


const senderBalance = (async(amount,senderWalletId) => {
    const sender = await User.findOne({ walletId: senderWalletId }); 
    let senderWallet = {};
    if(sender !== null && sender.balance > 0) {
        senderWallet = await User.findByIdAndUpdate(sender._id, {balance: sender.balance -= amount })
    } else if (sender === null) {
        throw new Error("User with the following id doesn't exist");
    } else if (sender !== undefined &&  sender.balance !== undefined && sender.balance < 0) {
        throw new Error("Insufficient balance");
    } 
    
    return senderWallet

})

const recipientBalance = (async(amount,recipientWalletId) => {
    console.log(recipientWalletId)
    const recipient = await User.findOne({ walletId: recipientWalletId });
    let recipientWallet = {};
    if(recipient) {
        recipientWallet = await User.findByIdAndUpdate(recipient._id, {balance: recipient.balance += amount })
    } else if(!recipient) {
        throw new Error("User with the following id doesn't exist")
    }
     return recipientWallet
    
})





module.exports = {
    recipientBalance,
    senderBalance,
    getUsersList
}

//yst id i paramov ugharkvac gtnelu enq ov e sendery, 
// senderic vercnelu enq wallety hanelu enq vorosh amount
// gtnelu enq recipientin yst ugharkvac walletid ov, avelacnelu enq ayd amounty