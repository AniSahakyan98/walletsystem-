const services = require('../services/transfer')


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

const getBalances = (async(req,res) => {
    const id =  {...req.params.id}
    const valId = Object.values(id)
    const result = Number(valId.join(""));
    const amount = {...req.body}.amount
    
    try {
        const senderBalance = await services.senderBalance(amount,result)
        const recipientBalance = await services.recipientBalance(amount,{...req.body}.walletId)

        return res.status(201).json({
            senderBalance: senderBalance,
            recipientBalance: recipientBalance
        })

    } catch(error) {
        return res.status(500).json({error: error.message})
    }
})

module.exports = {
    getBalances,
    getUserList
}

