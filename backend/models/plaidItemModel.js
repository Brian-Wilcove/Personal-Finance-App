const mongoose = require('mongoose')

const Schema = mongoose.Schema

const plaidBalanceSchema = new Schema({
    item_id: {
        type: String,
        required: true
    },
    access_token: {
        type: String,
        required: true
    },
    accounts: [{
        account_id: String,
        name: String,
        subtype: String,
        available_balance: Number,
        current_balance: Number,
    }]
})

module.exports = mongoose.model('PlaidItem', plaidBalanceSchema)