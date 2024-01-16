require('dotenv').config()

const { Configuration, PlaidEnvironments, PlaidApi } = require("plaid");
const util = require('util');
const mongoose = require('mongoose')
const PlaidItem = require('../models/plaidItemModel');

const PLAID_COUNTRY_CODES = process.env.PLAID_COUNTRY_CODES.split(',')
const PLAID_PRODUCTS = process.env.PLAID_PRODUCTS.split(',')

const prettyPrintResponse = (res) => {
    console.log(util.inspect(res.data, { colors: true, depth: 4 }));
};

//Initialize the Plaid client
const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
            'Plaid-Version': '2020-09-14',
        },
    },
});

const client = new PlaidApi(configuration)

//Function to get the access token from the ID
async function getAccessToken(id) {
    const plaidItem = await PlaidItem.findById(id)
    return plaidItem.access_token
}

//Creates Link Token that Link sends to Plaid servers
const createLinkToken = function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            const configs = {
                user: {
                    //TODO change this to a real user_id
                    client_user_id: "user-id",
                },
                client_name: "Personal Finance App",
                products: PLAID_PRODUCTS,
                country_codes: PLAID_COUNTRY_CODES,
                language: 'en'
            };
            const createTokenResponse = await client.linkTokenCreate(configs);
            prettyPrintResponse(createTokenResponse);
            res.json(createTokenResponse.data);
        })
        .catch(next);
}

// Creates an Access Token from Link's public Token & stores it in a DB
// TODO remove response (access token) from here
const setAccessToken = function (req, res, next) {
    PUBLIC_TOKEN = req.body.public_token;
    Promise.resolve()
        .then(async function () {
            const tokenResponse = await client.itemPublicTokenExchange({
                public_token: PUBLIC_TOKEN,
            });
            prettyPrintResponse(tokenResponse);
            const access_token = tokenResponse.data.access_token;
            const item_id = tokenResponse.data.item_id;
            try {
                const plaidItem = await PlaidItem.create({ item_id, access_token })
                res.status(200).json({
                    access_token: access_token,
                    item_id: item_id
                })
            } catch (error) {
                res.status(400).json({ error: error.message })
            }
        })
        .catch(next);
};

const deleteItem = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such Item' })
    }

    const plaidItem = await PlaidItem.findOneAndDelete({ _id: id })

    if (!plaidItem) {
        return res.status(404).json({ error: "No such Item" })
    }
    res.status(200).json('Success!')
}


//Gets a new Balance from Plaids Servers and logs it
const updateBalance = async (req, res, next) => {
    const { id } = req.params
    access_token = await getAccessToken(id)
    Promise.resolve()
        .then(async function () {
            const balanceResponse = await client.accountsBalanceGet({
                access_token: access_token,
            });
            //prettyPrintResponse(balanceResponse);
            const updatedData = []
            balanceResponse.data.accounts.forEach((account) =>{
                updatedData.push({
                    account_id: account.account_id,
                    name: account.name,
                    subtype: account.subtype,
                    available_balance: account.balances.available,
                    current_balance: account.balances.available
                })
            })
            const plaidItem = await PlaidItem.findByIdAndUpdate({_id: id}, {$set: {accounts: updatedData}})

            res.status(200).json(updatedData);
        })
        .catch(next);
};

const getBalances = async (req, res, next) => {
    const data = await PlaidItem.find({}).sort({ createdAt: -1 })
    const accounts = data.map((test) => test.accounts).flat()

    res.status(200).json(accounts)
}

module.exports = {
    createLinkToken,
    setAccessToken,
    getBalances,
    updateBalance,
    deleteItem
}