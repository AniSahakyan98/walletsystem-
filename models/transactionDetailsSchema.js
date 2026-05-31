const mongoose = require('mongoose')
const Schema =  mongoose.Schema

const transactionSchema = new Schema ({
    transactionId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING","FAILED","Completed","REFUNDED"],
        required: true
    },
    fromUser: { 
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    fromSystem: {
        type: String,
        default: null
    },
    to: { 
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

},{timestamps: true})

const Transaction = mongoose.model('Transaction',transactionSchema)
module.exports = Transaction