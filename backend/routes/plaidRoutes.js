const express = require('express')
const { info, createLinkToken, setAccessToken, getBalance } = require('../controllers/plaidController')

const router = express.Router()

router.post('/info', info)
router.post('/createLinkToken', createLinkToken)
router.post('/setAccessToken', setAccessToken)
router.get('/balance', getBalance)


module.exports = router