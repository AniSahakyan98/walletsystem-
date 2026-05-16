const mongoose = require('mongoose')
const Schema = mongoose.Schema

const user = new Schema({
    
    name: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    walletId: {
        type: Number,
        required: true
    }
})

const User = mongoose.model('User',user)
module.exports = User