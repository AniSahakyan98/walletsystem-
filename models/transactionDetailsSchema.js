const mongoose = require('mongoose')
const Schema =  mongoose.Schema

const transactionSchema = new Schema ({
    transactionId: {
        type: Number,
        require: true
    },
    amount: {
        type: Number,
        required: true
    }
    

},{timestamps: true})

const Transaction = mongoose.model('Transaction',transactionSchema)
module.exports = Transaction