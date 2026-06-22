const mongoose = require('mongoose')
const Schema = mongoose.Schema

const recurringTransferSchema = new Schema({
    fromUser: { 
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }, 
    amount: {
        type: Number,
        required: true
    },
    toUser: { 
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    frequency: {
        type: String,
        enum:  ["MONTHLY","ANNUALLY"],
        required: true
    },
    nextRunAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "PAUSED", "CANCELLED", "FAILED"],
        default: "ACTIVE"
    }

},{timestamps: true})


const Model = mongoose.model('RecurringPayment',recurringTransferSchema)
module.exports = Model



