const { format } = require('mysql2')
const Transaction = require('../models/transactionDetailsSchema')
const User = require('../models/usersSchema')
const stripe = require('../stripe')
const jwt = require('jsonwebtoken')
const mongoose = require("mongoose")

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


//backend sends amount info to stripe by paymentIntents and Frontend uses client_secret to complete payment securely
const topUp = async(amount,userId)=>{
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: "usd",
        metadata: {userId},
    })

    const user = await User.findOne({walletId: userId});
    const transaction = await Transaction.create({
        transactionId: paymentIntent.id,
        amount,
        status: "PENDING",
        fromSystem: "STRIPE",
        to: user._id
    });

    console.log(transaction)
    
    return {
        clientSecret: paymentIntent.client_secret,
        transactionId: paymentIntent.id
    }
}

const refundFunction = (async(transactionId) => {
    const transaction = await Transaction.findOne({transactionId})

    if(!transaction) {
        throw new Error("Transaction Not Found")
    } 
    if(transaction.status !== "Completed") {
        throw new Error("Only Completed transactions can be refunded")
    }
    stripe.refunds.create({
        payment_intent: transactionId
    })

    transaction.status = "REFUNDED"
    await transaction.save()

})


//improve function with session
const transferBalance = (async(amount,senderWalletId,recipientWalletId) => {
    const session = await mongoose.startSession()

    try{ 
    session.startTransaction()

    const sender = await User.findOne({ walletId: senderWalletId }).session(session); 
    const recipient = await User.findOne({ walletId: recipientWalletId}).session(session);
    
    
    if(!sender || !recipient){
        throw new Error("User not found")
    }
    if (amount <= 0) {
        throw new Error("Amount must be greater than 0"); 
    } 
    if(sender.walletId === recipient.walletId){
        throw new Error("Sender and recipient can not be the same");
    }
    if (sender.balance < amount) {
        throw new Error("Insufficient Balance");
    }

        await User.updateOne(
            {_id: sender._id},
            {$inc: {balance: -amount}}
        ).session(session)

        await User.updateOne(
            {_id: recipient._id},
            {$inc: {balance: amount}}
        ).session(session)

        transaction = await Transaction.create([{
                transactionId: Date.now(),
                amount,
                status: "Completed",
                fromUser: sender._id,
                to: recipient._id
        }],{session})
         
        await session.commitTransaction()
        return {
            "transactionId": transaction[0].transactionId,
            "senderWallet": sender,
            "recipientWallet": recipient
            }
        } catch(error) {
           await session.abortTransaction()
           throw error
        } finally {
            session.endSession()
        } 
        
})

const getTransactions = (async(id) => {

    if(id !== undefined) {
        const user= await User.findOne({walletId: id})
        
        let ins = await Transaction.find({to: user._id})
        let outs = await Transaction.find({fromUser: user._id})

        return {
            "ins": ins,
            "outs": outs
        }

    } else {
        throw new Error("User doesn't exist")
    }
    
})




module.exports = {
    transferBalance,
    getUsersList,
    userLogin,
    getTransactions,
    topUp,
    refundFunction
}

//yst id i paramov ugharkvac gtnelu enq ov e sendery, 
// senderic vercnelu enq wallety hanelu enq vorosh amount
// gtnelu enq recipientin yst ugharkvac walletid ov, avelacnelu enq ayd amounty