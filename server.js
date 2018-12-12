const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongo = require('./scripts/mongo');
const cons = require('consolidate');

app.use(express.static('public'));
app.use(express.static('scripts'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/public');

app.get('/', (req, res) => {
    res.render('index',{}, (err, html) => {
        if (err) {throw err}
        res.send(html);
    });
});

app.get('/tdl', (req, res) => {
    res.render('tdl',{}, (err, html) => {
        if (err) {throw err}
        res.send(html);
    });
});

app.get('/registry', (req, res) => {
    res.render('registry',{}, (err, html) => {
        if (err) {throw err}
        res.send(html);
    });
});

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
});

app.post('/tdl', function (req, res) {
    mongo.saveData(req.body);

});

app.listen(3001, function(){
    console.log('Server has started on port 3001' + ' ---' + (new Date()));
});
