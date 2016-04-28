var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

UserProvider = function(host, port) {
    this.db = new Db('node-mongo-user', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
    this.db.open(function() {});
};

UserProvider.prototype.getCollection = function(callback) {
    this.db.collection('users', function(error, user_collection) {
        if (error) {
            callback(error);
        } else {
            callback(null, user_collection);
        }
    });
};

// find all users
UserProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, user_collection) {
       if (error) {
           callback(error);
       } else {
           user_collection.find().toArray(function(error, results) {
               if (error) {
                   callback(error)
               } else {
                   callback(null, results);
               }
           });
       }
    });
}

// find specific user
UserProvider.prototype.find = function(query, callback) {
    var matches = [];
    
    this.getCollection(function(error, collection) {
        var cursor = collection.find(query);
        cursor.each(function(err, doc) {
            if (!err) {
                if (doc != null) {
                    matches.push(doc);
                } else {
                    callback(null, matches);
                }
            } else {
                callback(err);
            }
            
        });
        
    });
}

// save new user
UserProvider.prototype.save = function(users, callback) {
    this.getCollection(function(error, user_collection) {
       if (error) {
           callback(error);
       } else {
           if (typeof(users.length) == "undefined") {
               users = [users]
           }
           
           for (var x=0; x<users.length; x++) {
               user = users[x];
               user.created_time = new Date();
           }
           
           user_collection.insert(users, function() {
               callback(null, users);
           })
       }
    });
}

exports.UserProvider = UserProvider;