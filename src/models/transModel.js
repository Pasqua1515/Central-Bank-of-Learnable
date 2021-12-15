const { Schema, model } = require("mongoose")
const Transactions = new Schema({
    account: { type: String },
    credit: {
        type: Boolean
    },
    debit: {
        type: Boolean
    },
    sender: {
        type: String
    },
    receiver: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    transaction: {
        type: String
    },
    desc: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        trim: true,
        default: Date.now
    },
    total: {
        type: Number
    },
    reversed: false
})


const Trans = model("Transaction", Transactions)

module.exports = Trans