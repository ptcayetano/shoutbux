var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

ShoutProvider = function(host, port) {
    this.db = new Db('node-mongo-shout', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
    this.db.open(function() {});
};

ShoutProvider.prototype.getCollection = function(callback) {
    this.db.collection('shouts', function(error, shout_collection) {
       if (error) {
           callback(error);
       } else {
           callback(null, shout_collection);
       }
    });
};

ShoutProvider.prototype.find = function(query, callback) {
    var matches = [];
    
    this.getCollection(function(error, collection) {
        var cursor = collection.find(query).sort({'created_time': -1});
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
    })
}

// save new shout
ShoutProvider.prototype.save = function(shouts, callback) {
    this.getCollection(function(error, shout_collection) {
       if (error) {
           callback(error);
       } else {
           if (typeof(shouts.length) == "undefined") {
               shouts = [shouts]
           }
           
           for (var x=0; x<shouts.length; x++) {
               shout = shouts[x];
               shout.created_time = new Date();
           }
           
           shout_collection.insert(shouts, function() {
               callback(null, shouts);
           })
       }
    });
}

// remove shout 
ShoutProvider.prototype.deleteById = function(id, callback) {
    this.getCollection(function(error, shout_collection) {
       if (error) {
           callback(error);
       } else {
           if (id) {
               shout_collection.remove({_id: ObjectID(id)}, function(error, result) {
                   if (error) {
                       callback(error);
                   } else {
                       callback(null, result)
                   }
               })
           }  
       }
    });
}

exports.ShoutProvider = ShoutProvider;