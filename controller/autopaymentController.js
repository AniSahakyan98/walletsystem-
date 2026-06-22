const service = require('../services/autopayment')


const autopaymentConfig = (async(req,res) => {
    try {
    const sender = req.params.id
    const {recipient, frequency, amount } = req.body
    const result = await service.autopaymentConfig(sender, recipient,frequency,amount)
        return res.status(201).json(result)
    } catch(error) {
        return res.status(500).json({error: error.message})
    }

})

module.exports = {
    autopaymentConfig
}
//sender,recipient,frequency,amount,nextRunAt