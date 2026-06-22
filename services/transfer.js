const { format } = require('mysql2')
const Transaction = require('../models/transactionDetailsSchema')
const User = require('../models/usersSchema')
const Ledger = require('../models/ledgerEntries')
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
    const stripe = require('../stripe');
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

    const userId = transaction.to
    const amount = transaction.amount
    console.log(amount)

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

    await User.updateOne({_id: userId},{$inc: {balance: -amount}})


})
//get balance endpoint
const getUserInfo = (async(walletId) => {
    const user = await User.findOne({walletId})
    if(user) {
        return {"walletId": user.walletId,"name": user.name,"balance": user.balance}
    } else {
        throw new Error("No user Found")
    }
})



//improve function with session
const transferBalance = (async(amount,senderWalletId,recipientWalletId) => {
    const session = await mongoose.startSession()

    try{ 
    session.startTransaction()

    if (amount <= 0) {
        throw new Error("Amount must be greater than 0"); 
    } 
    

    const sender = await User.findOne({ walletId: senderWalletId }).session(session); 
    const recipient = await User.findOne({ walletId: recipientWalletId}).session(session);
    
    // console.log("Sender balance:", sender.balance)
    // console.log("Transfer amount:", amount)
    if(sender.walletId === recipient.walletId){
        throw new Error("Sender and recipient can not be the same");
    }

    if(!sender || !recipient){
        throw new Error("User not found")
    }
    
    const debitResult = await User.updateOne(
    {
        _id: sender._id,
        balance: {$gte: amount}
    },
    {$inc: {balance: -amount}},
    {session})

    console.log(debitResult)
    if(debitResult.modifiedCount === 0) {
        throw new Error("Insufficient balance")
    }

    await User.updateOne(
        {_id: recipient._id},
        {$inc: {balance: amount}},
        {session}
    )


        const transactId = Date.now()
        const ledgerEntry = await Ledger.create([{
            transactionId: transactId,
            userId: sender._id,
            type: "DEBIT",
            amount
        },
        { 
            transactionId: transactId,
            userId: recipient._id,
            type: "CREDIT",
            amount
        }], {session,
            ordered: true})


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
            amount,
            "status": "Completed",
            "senderWallet": sender.balance - amount,
            "recipientWallet": recipient.balance + amount
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


// Transaction analytics API (BEST NEXT STEP)
// Instead of UI charts, you expose data APIs like:

// monthly income/expense summary
// total sent / received
// top counterparties
// daily/weekly stats

// Example endpoints:

// GET /analytics/summary
// GET /analytics/monthly
// GET /analytics/top-users

const summary = (async(walletId) => {
    const user = await User.findOne({walletId})
    const id = user._id

    const spending = await Transaction.aggregate([{$match: {fromUser: id}}, 
    {$group: {
        _id: null,
        totalSpending: {$sum: "$amount"} 
        }
    }])

    const revenue = await Transaction.aggregate([{$match: {to: id}},
    {$group: {
        _id: null,
        totalRevenue: {$sum: "$amount"}
    }
    }])
  
   
    return {spending,revenue}

})

//to- ins
const dateFilter = (async(walletId,period) => {
    const user = await User.findOne({walletId: walletId})
     if(period === "weekly") {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate()-7)

        const transaction = await Transaction.find({
            to: user._id,
            createdAt: {$gte: oneWeekAgo}
        })

        return transaction
     } else if (period === "monthly") {
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth()-1)
        //console.log(oneMonthAgo)

        const transaction = await Transaction.find({
            to: user._id,
            createdAt: {$gte: oneMonthAgo}
        })

        return transaction
     } else if (period === "daily") {
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)
        
        const transaction = await Transaction.find({
            to: user._id,
            createdAt: {$gte: startOfDay,
                        $lte: endOfDay
                        }
        })

        return transaction
     }

})

const getBalanceFromLedger = async(walletId) => {
    const user = await User.findOne({walletId:walletId})
    if (!user) {
    throw new Error("User not found");
}
    const id = user._id

    const result = await Ledger.aggregate([
        {$match: {userId: id}},
        {$group : {
            _id: "$type",
            total: {$sum: "$amount"}
        }}
    ])
     
    let debitTotal = 0;
    let creditTotal = 0;

    result.forEach((item) => {
       if (item._id === "CREDIT") creditTotal = item.total
       if (item._id === "DEBIT")  debitTotal = item.total
    })
    
    
    const balance = creditTotal - debitTotal
    return {"balance": balance}
}
    

//Turn wallet into a game:top senders, top receivers
//fund _id s and replace with names - this part pending



//cashback rewards
const topUsers = async() => {

    const senders = await Ledger.aggregate([
        {$match: {"type" : "DEBIT"}},
        {$group: {
            _id: "$userId",
            "total": {$sum : "$amount"}
        }},
        {$sort: {total: -1}}
    ])

    const topSenders = await Promise.all(
        senders.filter((item) => {
        return item._id !== null
    }).map(async(item) => {
       
       const user = await User.findOne({_id: item._id})
       item.name = user.name
       delete item._id
       return item
    }))

    const receivers = await Ledger.aggregate([
        {$match: {"type" : "CREDIT"}},
        {$group: {
            _id: "$userId",
            "total": {$sum : "$amount"}
        }},
        {$sort: {total: -1}}
    ])

    const topReceivers = await Promise.all(
        receivers.filter((item) => {
        return item._id !== null
       }
    ).map(async(item) => {
       
       const user = await User.findOne({_id: item._id})
       item.name = user.name
       delete item._id
       return item
    }))

   

    return {"topSenders": topSenders, "topReceivers": topReceivers }
    
}

//reconciliation system

const getMisMatches = (async() => {
    const users = await User.find()

    const result = await Promise.all(users.map(async(item) => {
        const ledger = await getBalanceFromLedger(item.walletId)
        console.log(ledger)
        const ledgerBalance = ledger.balance
        if(item.balance === ledgerBalance) {
        return {
            "walletId": item.walletId,
            "storedBalance": item.balance,
            "ledgerBalance": ledgerBalance,
            "status" : "OK"
            }
            
        } else {
            return {
            "walletId": item.walletId,
            "storedBalance": item.balance,
            "ledgerBalance": ledgerBalance,
            "status" : `MisMatch of ${ledgerBalance - item.balance}`
            }
        }
    }))

    return result
})


//recurrning transfers


module.exports = {
    transferBalance,
    getUsersList,
    userLogin,
    getTransactions,
    topUp,
    refundFunction,
    getUserInfo,
    summary,
    dateFilter,
    getBalanceFromLedger,
    topUsers,
    getMisMatches
}

//yst id i paramov ugharkvac gtnelu enq ov e sendery, 
// senderic vercnelu enq wallety hanelu enq vorosh amount
// gtnelu enq recipientin yst ugharkvac walletid ov, avelacnelu enq ayd amounty