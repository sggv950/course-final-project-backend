'use strict';

const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://nmkleiner:n132424@ds151840.mlab.com:51840/toy'
// const url = 'mongodb://localhost:27017';
const dbName = 'toy';

var dbConn = null;

module.exports = {
    connectToDB,
}

function connectToDB() {
    if (dbConn) return Promise.resolve(dbConn);
    

    return new Promise((resolve, reject) => {
        mongoClient.connect(url,{ useNewUrlParser: true }, (err, client) => {
            if (err) return reject('Cannot connect to Mongo')
            dbConn = client.db(dbName);
            return resolve(dbConn);
        })
    })
}