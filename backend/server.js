//read in env vars from .env file
require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const util = require('util')

const plaidRoutes = require('./routes/plaidRoutes')

//express app
const app = express()

// middleware
app.use(express.urlencoded({
    extended: false,
}))
app.use(express.json())


app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

//routes
app.use('/api/plaid', plaidRoutes)


//error handling
app.use('/api', function (error, request, response, next) {
    prettyPrintResponse(error.response);
    response.json(formatError(error.response));
  });

const formatError = (error) => {
    return {
      error: { ...error.data, status_code: error.status },
    };
  };

const prettyPrintResponse = (response) => {
    console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

//start app & connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('connected to db & listening on port', process.env.PORT)
        })
}).catch((e) => {
    console.log(e)
})

