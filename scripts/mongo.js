const mongoose    = require('mongoose');
const crypto      = require('crypto');
const jwt         = require('jsonwebtoken');

mongoose.connect('mongodb+srv://redfalk0n:123321@cluster0-wa3uj.mongodb.net/test?retryWrites=true');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    hash: {type: String, required: true},
    salt: {type: String, required: true},
    idCounter: {type: String},
    data: []
});

UserSchema.methods.setUser = function(username, password){
    this.username = username;
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    this.idCounter = 0;
    this.data = []
};

UserSchema.methods.validatePassword = function(password){
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generateToken = function(){
    return jwt.sign({
        username: this.username,
        id: this._id
    }, 'ToDoSecret', {expiresIn: '1d'})
};

const Users = mongoose.model('user', UserSchema)

module.exports.Users = Users;

module.exports.getData = function(username, callback){
    Users.findOne({username: username}, (err, data) => {
        if (err || !data) { callback('failure')};
        let ans = {
            data: data._doc.data,
            idCounter: data._doc.idCounter
        };
        callback(ans);
    })
};

module.exports.saveData = function(user, data, callback){
    Users.update({username: user}, {$set: {data: data.data, idCounter: data.idCounter}}, (err, affected, resp) => {
        if (err) {throw err};
        callback('done');
    });
};


