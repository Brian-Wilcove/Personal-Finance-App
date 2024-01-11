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

const info = async (req, res) => {
    res.json({
        item_id: "test",
        access_token: "test2",
        products: "test3"
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

module.exports = {
    info,
    createLinkToken
}