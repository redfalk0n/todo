const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const mongo = require('./scripts/mongo');

app.use(express.static('public'));
app.use(express.static('scripts'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.post('/auth', function (req, res){
    mongo.getData(req.body.login, req.body.password, function(data){
        if (data.length === 0){
            res.send('no data');
            console.log('Failed auth for user ' + req.body.login + ' ---' + (new Date()));
        } else {
            res.send('valid data');
            console.log('User "' + req.body.login + '" successfully logged in' + ' ---' + (new Date()))
        }
    });
});

app.post('/registry', function (req, res) {
    mongo.newUser(req.body.login, req.body.password, function(answer){
        res.send(answer)
    });
});

app.post('/getList', function (req, res) {
    mongo.getData(req.body.login, req.body.password,function(data){
        res.send(data[0]);
        console.log('Data for user "' + req.body.login + '" successfully sended' + ' ---' + (new Date()))
    });
    //res.sendFile(__dirname + '/listData.txt');
});

app.post('/tdl', function (req, res) {
    mongo.saveData(req.body);
    /*fs.writeFile('listData.txt', JSON.stringify(req.body), function(error){
        if(error) throw error;
        console.log('File saved');
    });*/
});

app.listen(3001, function(){
    console.log('Server has started on port 3001' + ' ---' + (new Date()));
});

let asd = 1;