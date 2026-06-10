const services = require('../services/transfer')

const userLogin = (async(req,res) => {

    try {
        const user = await services.userLogin({...req.body}.walletId)
        return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({error: error.message})
    }
    
})

const getUserList = (async(req,res) => {
    try {
        const list = await services.getUsersList()
        res.status(201).json({
            users: list
        })
    } catch(error) {
        res.status(500).json({error:error.message})
    }
})

//stripe

const topUp = (async(req,res) => {
    try {
        const userId = req.user.walletId
        const amount = req.body.amount
        const result = await services.topUp(amount,userId)

        return res.status(201).json(result)
    } catch(error) {
        res.status(500).json({error:error.message})
    }

})


const transactionBalanceController = (async(req,res) => {
    
    const senderId = req.user.walletId
    
    try {
        const {amount, walletId: recipientId} = req.body

        let transaction = await services.transferBalance(amount,senderId,recipientId)
        return res.status(200).json(transaction)

    } catch(error) {
        return res.status(500).json({error: error.message})
    }
})


const getTransactions = (async(req,res) => {
    try {
        const id = req.params.id
        const transaction = await services.getTransactions(id)
        return res.status(201).json(transaction)
    } catch(error) {
        return res.status(500).json({error: error.message})
    }
})

const refundFunction =(async(req,res) => {
    try{
        const transactionId = req.params.id
        const refundAmount = await services.refundFunction(transactionId)
        return res.status(200).json(refundAmount)
    } catch(error) {
        return res.status(500).json({error: error.message})
    }


})

const getUserInfo = (async(req,res) =>{
    try {
        const id = req.params.id
        const userInfo = await services.getUserInfo(id)
        return res.status(200).json(userInfo)
    } catch(error) {
        return res.status(500).json({error: error.message})
    }
})

const summary = (async(req,res) => {
    try {
    const walletId = req.params.id
    const summary = await services.summary(walletId)
        if(summary.spending.length !== 0 && summary.revenue.length !== 0){
            return res.status(200).json({
                "spending": summary.spending[0].totalSpending,
                "revenue": summary.revenue[0].totalRevenue
            })
        } else if(summary.spending.length === 0) {
            return res.status(200).json({
                "revenue": summary.revenue[0].totalRevenue
            })
        } else if(summary.revenue.length === 0){
            return res.status(200).json({
                "spending": summary.spending[0].totalSpending
            })
        }
    } catch(error) {
        return res.status(500).json({error: error.message})
    }
})


const dateFilter = (async(req,res) => {
    try {
        const period = req.query.period
        const walletId = req.query.walletId

        const result = await services.dateFilter(walletId,period)
        return res.status(200).json(result)
    } catch(error) {
        return res.status(500).json({error: error.message})
    }
})

const getBalanceFromLedger = (async(req,res) => {
    try {
    const id = req.params.id
    const result = await services.getBalanceFromLedger(id)
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
})

const topUsers = (async(req,res) => {
    try {
        const result = await services.topUsers()
        return res.status(200).json(result)
    } catch(error) {
      return res.status(500).json({error: error.message})
    }
})

module.exports = {
    transactionBalanceController,
    getUserList,
    userLogin,
    getTransactions,
    topUp,
    refundFunction,
    getUserInfo,
    summary,
    dateFilter,
    getBalanceFromLedger,
    topUsers
}

