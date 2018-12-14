const express = require('express');
const bodyParser = require('body-parser');
const cons = require('consolidate');
const morgan = require('morgan')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoLocal = require('passport-local-mongoose');

const app = express();

mongoose.connect('mongodb://localhost/test');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    hash: {type: String, required: true},
    salt: {type: String, required: true},
    data: {type: Array, default: []}
});


UserSchema.methods.setShtuki = function(dsa, ewq, rew){
    this.username = dsa;
    this.hash = ewq;
    this.salt = rew
};

const User = mongoose.model('user', UserSchema);

var qwe = new User;
qwe.setShtuki('adfsdq', 'eqweqwerwq', 'eqwerqrt');
qwe.save();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
//app.use(passport.session());

passport.use(new LocalStrategy(
    function(username, password, done) {
        done(null ,'321');
        /*console.log(username + ' ' + password);
        User.findOne({ username: username }, function (err, user) {
            if (err) {
                console.log('dsa');
                return done(err); }

            if (!user) {
                console.log('qwe');
                return done(null, false); }
            if (!user.verifyPassword(password)) {
                console.log('ewq');
                return done(null, false); }
            console.log('zxc');
            return done(null, user);
        });*/
    }
));


app.post('/a', passport.authenticate('local', {failureRedirect: '/b', session: false}), (req, res) => {
    res.send('norm')
});

app.get('/b', (req, res) => {
    res.send('ne norm')
});

app.listen(3005, () => console.log('Running'));