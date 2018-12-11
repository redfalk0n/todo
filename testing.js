const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb+srv://redfalk0n:123321@cluster0-wa3uj.mongodb.net/test?retryWrites=true';
const dbName = 'toDos';

var data;

function getData(callback){
    MongoClient.connect(url, function(err, client){
        assert.equal(null, err);
        const db = client.db(dbName);
        const collection = db.collection('data');

        collection.find({id:0}).toArray(function(err, data){
            callback(data)
        })
    })
}

getData(function (data) {
    console.log(data)
})