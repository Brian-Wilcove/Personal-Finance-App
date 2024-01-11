const express = require('express')
const { info, createLinkToken } = require('../controllers/plaidController')

const router = express.Router()

router.get('/info', info)
router.post('/createLinkToken', createLinkToken)

module.exports = router