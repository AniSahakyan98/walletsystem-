const mongoose = require('mongoose')
const Schema =  mongoose.Schema

const transactionSchema = new Schema ({
    transactionId: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING","FAILED","Completed"],
        required: true
    },
    from: { 
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    to: { 
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true

    },

},{timestamps: true})

const Transaction = mongoose.model('Transaction',transactionSchema)
module.exports = Transaction