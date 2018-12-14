const express       = require('express');
const bodyParser    = require('body-parser');
const cons          = require('consolidate');
const morgan        = require('morgan');
const passport      = require('passport');
const expressJwt    = require('express-jwt');
const passportConf  = require('./scripts/passportConfig');
const mongo         = require('./scripts/mongo');
const app = express();
require('./scripts/passportConfig');

app.use(morgan('short'));
app.use(express.static('public'));
app.use(express.static('scripts'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(passport.initialize());

passport.use('newUser', passportConf.newUser);
passport.use('existedUser', passportConf.existedUser);

app.engine('html', cons.swig);
app.engine('pug', cons.pug);
app.set('view engine', 'html');
app.set('view engine', 'pug');
app.set('views', __dirname + '/public');

//, passport.authenticate('local', {failureRedirect: '/b', session: false}),
app.post('/registry', passport.authenticate('newUser', {session: false}), (req, res) => {
    res.send(req.user);
});

app.post('/auth', passport.authenticate('existedUser', {session: false}), (req, res) => {
    res.send(req.user);
});

app.get('/', (req, res) => {
    res.render('index.html', (err, html) => {
        if (err) {throw err}
        res.send(html);
    });
});

app.get('/tdl', (req, res) => {
    res.render('tdl.html', (err, html) => {
        if (err) {throw err}
        res.send(html);
    });
});

app.get('/registry', (req, res) => {
    res.render('registry.pug', (err, html) => {
        if (err) {throw err}
        res.send(html);
    });
});

app.get('/getList', expressJwt({secret: 'ToDoSecret'}), function (req, res) {
    mongo.getData(req.user.username,function(data){
        res.send(data);
        console.log('Data for user "' + req.body.login + '" successfully sended' + ' ---' + (new Date()))
    });
});

app.post('/tdl', expressJwt({secret: 'ToDoSecret'}), function (req, res) {
    mongo.saveData(req.user.username, req.body, (answer) => {
        res.send(answer);
    });

});

app.listen(3001, function(){
    console.log('Server has started on port 3001' + ' ---' + (new Date()));
});
