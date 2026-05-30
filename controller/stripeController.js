const stripeService = require('../services/stripe')


const webhookController = async(req,res) => {
    try {
        await stripeService.handleStripeEvent(req.body)
        res.status(201).json({received: true})
    } catch(error) {
        res.status(500).json({error: error.message})
    }
}

module.exports = {
    webhookController
}