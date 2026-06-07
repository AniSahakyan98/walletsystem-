const mongoose = require('mongoose')
const Schema = mongoose.Schema


const ledger = new Schema({
    transactionId: {
        type: String,
        required: true
    },
    userId: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    provider: {
        type: String,
        default: null
    },
    type: {
        type: String,
        enum: ["DEBIT", "CREDIT"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
},{timestamps:true})


const Ledger = mongoose.model('Ledger',ledger)
module.exports = Ledger