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
    
    // type: {
    //     type: String,
    //     enum: ["SIMPLE","AUTOPAYMENT"],
    //     required: true
    // },
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
    }

},{timestamps: true})

// transactionSchema.pre("save", function(next) {
//     if(this.type === "SIMPLE"){
//         this.schedule = undefined
//     } 
//     next()
// })

const Transaction = mongoose.model('Transaction',transactionSchema)
module.exports = Transaction