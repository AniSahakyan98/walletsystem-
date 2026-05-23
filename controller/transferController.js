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

const getBalances = (async(req,res) => {
    
    const senderId = req.user.walletId
    
    try {
        let balances = await services.transferBalance({...req.body}.amount,senderId,{...req.body}.walletId)
        console.log(balances)
        return res.status(201).json(balances)

    } catch(error) {
        return res.status(500).json({error: error.message})
    }
})

module.exports = {
    getBalances,
    getUserList,
    userLogin
}

