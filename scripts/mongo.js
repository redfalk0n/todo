const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

//const url = 'mongodb+srv://redfalk0n:123321@cluster0-wa3uj.mongodb.net/test?retryWrites=true'; облачная монга
const url = 'mongodb://localhost:27017';
const dbName = 'toDos';

module.exports.saveData = function(data){
    MongoClient.connect(url, function(err, client){
        assert.equal(null, err);
        const db = client.db(dbName);
        const collection = db.collection('data');

        collection.updateOne( { login: data.login, password: data.password }, { $set: { data: data.data, idCounter: data.idCounter }}, function(err, result) {
            assert.equal(err, null);
            console.log('Data for user "' + data.login + '" successfully saved' + ' ---' + (new Date()));
        });

        client.close();
    });
};

module.exports.getData = function(login, password, callback){
    MongoClient.connect(url, function(err, client){
        assert.equal(null, err);
        const db = client.db(dbName);
        const collection = db.collection('data');

        collection.find({login: login, password: password}).toArray(function(err, data){
            callback(data);
        })
    })
};

module.exports.newUser = function(login, password, callback){
    MongoClient.connect(url, function(err, client){
        assert.equal(null, err);
        const db = client.db(dbName);
        const collection = db.collection('data');

        collection.find({login: login, password: password}).toArray(function(err, data){
            if (data.length !== 0){
                callback('existed');
                console.log('Failed user "' + login + '" creation: already existed' + ' ---' + (new Date()));
            } else {
                collection.insertOne({login: login, password: password, idCounter: 0, data:[]});
                callback('success');
                console.log('User "' + login + '" successfully created' + ' ---' + (new Date()))
            }
        })
    })
};
