const { format } = require('mysql2')
const Transaction = require('../models/transactionDetailsSchema')
const User = require('../models/usersSchema')
const jwt = require('jsonwebtoken')


const userLogin = (async(walletId) => {
    
    const user = await User.findOne({walletId: walletId})

    if(!user) {
       throw new Error("User not found");
    }

    const token = jwt.sign(
        {
            walletId: user.walletId,
            userId: user._id
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    )

    return {
        message: "Login Successful",
        token
    }
})


const getUsersList = (async() => {
    const list = await User.find()
    return list
})


//transaction faily - testel
const transferBalance = (async(amount,senderWalletId,recipientWalletId) => {
    const sender = await User.findOne({ walletId: senderWalletId }); 
    const recipient = await User.findOne({ walletId: recipientWalletId});
    let senderWallet = {}
    let recipientWallet = {};
    let transaction = {}
    
    if (sender !== undefined && recipient !== undefined) {
        if (amount <= 0) {
             throw new Error("Amount must be greater than 0");
        } else if (sender.balance < amount) {
            throw new Error("Insufficient balance");
        } else if (sender.balance > amount) {

        transaction = await Transaction.create({
                transactionId: Date.now(),
                amount,
                status: "PENDING",
                from: sender._id,
                to: recipient._id
        })

           senderWallet = await User.findByIdAndUpdate(sender._id, {balance: sender.balance -= amount })
           recipientWallet = await User.findByIdAndUpdate(recipient._id, {balance: recipient.balance += amount })

           transaction.status = "Completed"
           await transaction.save()
        } 
    } else if(sender === null || recipient === null) {
       throw new Error("User with the following id doesn't exist");
    } else  {
        transaction.status = "FAILED";
        await transaction.save();
        throw new Error("Transfer failed")
    }
    return {
            "transactionId": transaction.transactionId,
            "senderWallet": senderWallet,
            "recipientWallet": recipientWallet
            }

})



module.exports = {
    transferBalance,
    getUsersList,
    userLogin
}

//yst id i paramov ugharkvac gtnelu enq ov e sendery, 
// senderic vercnelu enq wallety hanelu enq vorosh amount
// gtnelu enq recipientin yst ugharkvac walletid ov, avelacnelu enq ayd amounty