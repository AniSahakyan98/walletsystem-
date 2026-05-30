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


module.exports = {
    transactionBalanceController,
    getUserList,
    userLogin,
    getTransactions,
    topUp
}

