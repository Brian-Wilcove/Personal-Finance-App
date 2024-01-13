require('dotenv').config()

const { Configuration, PlaidEnvironments, PlaidApi } = require("plaid");
const util = require('util');


const PLAID_COUNTRY_CODES = process.env.PLAID_COUNTRY_CODES.split(',')
const PLAID_PRODUCTS = process.env.PLAID_PRODUCTS.split(',')

const prettyPrintResponse = (response) => {
    console.log(util.inspect(response.data, { colors: true, depth: 4 }));
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


//TODO get rid of after it's working?
const info = async (req, res) => {
    res.json({
        item_id: null,
        access_token: null,
        products: PLAID_PRODUCTS
    })
}

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
// TODO remove response (access token) from here -> Replace with inputting into DB
const setAccessToken =  function (req, res, next) {
    PUBLIC_TOKEN = req.body.public_token;
    Promise.resolve()
      .then(async function () {
        const tokenResponse = await client.itemPublicTokenExchange({
          public_token: PUBLIC_TOKEN,
        });
        prettyPrintResponse(tokenResponse);
        ACCESS_TOKEN = tokenResponse.data.access_token;
        ITEM_ID = tokenResponse.data.item_id;
        res.json({
          // TODO the 'access_token' is a private token, DO NOT pass this token to the frontend in your production environment
          access_token: ACCESS_TOKEN,
          item_id: ITEM_ID,
          error: null,
        });
      })
    .catch(next);
};

//TODO make this get the access token from the DB
const getBalance = function (request, response, next) {
    console
    Promise.resolve()
      .then(async function () {
        const balanceResponse = await client.accountsBalanceGet({
          access_token: 'ACCESS TOKEN',
        });
        prettyPrintResponse(balanceResponse);
        response.json(balanceResponse.data);
      })
    .catch(next);
};

module.exports = {
    info,
    createLinkToken,
    setAccessToken,
    getBalance
}