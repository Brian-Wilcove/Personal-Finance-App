const express = require('express')
const { createLinkToken, setAccessToken, getBalances, updateBalance, deleteItem } = require('../controllers/plaidController')

const router = express.Router()

//create a Link Token
router.post('/createLinkToken', createLinkToken)

//Create and set an Item, Access Token, and log into DB
router.post('/setAccessToken', setAccessToken)

//Delete a specific Item
router.delete('/:id', deleteItem)

//get all balances from DB
router.get('/balance', getBalances)

//update DB balance from Plaid
router.patch('/balance/:id', updateBalance)


module.exports = router