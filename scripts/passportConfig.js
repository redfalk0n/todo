const LocalStrategy = require('passport-local');
const mongo = require('./mongo');

const users = mongo.Users;

module.exports.newUser = new LocalStrategy(
    (username, password, done) => {
        users.findOne({username: username}).then((user) => {
            if(user) {
                return done(null, false, {message: 'User already existed!'})}
            let newUser = new users;
            newUser.setUser(username, password);
            newUser.save();
            return done(null, newUser.generateToken());
        }).catch(done);
    });

module.exports.existedUser = new LocalStrategy(
    (username, password, done) => {
        users.findOne({username: username}).then( (user) => {
            if (!user || !(user.validatePassword(password))) {
                return done(null, false, {message: 'Failed auth'})
            }
            return done(null, user.generateToken())
        }).catch(done)
    }
);
