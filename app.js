var express = require('express'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    session = require('client-sessions'),
    UserProvider = require('./userprovider.js').UserProvider,
    ShoutProvider = require('./shoutprovider.js').ShoutProvider;

var app = new express(),
    port = process.env.PORT || 4000;
    
/**
 * sends JSON response
 */
var sendErrorResponse = function(res, err, code) {
    console.log("Sending Error Response - ", err);
    res.writeHead(code, {"Content-Type": "application/json"});
    res.end();
}

/** 
 * send Ok or Success response
 */
var sendSuccessResponse = function(res, data) {
    console.log("Sending Success Response");
    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(data));
    res.end();
}

/**
 * user trying to access dashboard
 */
var accessingDashboard = function(req, res) {
    if (req.session && req.session.signedinUser) {
        console.log("User is currently logged in >>>", req.session.signedinUser);
        fs.readFile('dashboard.html', 'binary', function(err, file) {
            if(err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.write(err + '\n');
                res.end();
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(file, 'binary');
            res.end();
            
        });
    } else {
        console.log("User is not logged in redirecting to index");
        res.redirect("/");
    }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
    
app.use(function(req, res, next) {
    res.header('X-Frame-Options', 'DENY');
    res.header('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-XSS-Protection', '1; mode=block');
    return next();
});

app.use(session({
    cookieName: 'session',
    secret: 'shoutbux1234',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));

var userProvider = new UserProvider('localhost', 27017),
    shoutProvider = new ShoutProvider('localhost', 27017);

app.get('/', function(req, res) {
    fs.readFile('index.html', 'binary', function(err, file) {
        if(err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.write(err + '\n');
            res.end();
            return;
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(file, 'binary');
        res.end();
        
    });
});

// statics
app.get('/dashboard', accessingDashboard);
app.get('/dashboard.html', accessingDashboard);

/**
 * authentication
 */
app.post('/auth', function(req, res) {
    if (req && req.body && req.body.username && req.body.password) {
        
        userProvider.find({'username': req.body.username, 'password': req.body.password}, function(error, collection) {
            if (!error) {
                if (collection.length > 0) {
                    req.session.signedinUser = collection[0];
                    sendSuccessResponse(res, collection[0]);
                } else {
                    sendErrorResponse(res, "Precondition Failed", 412);
                }
                
            } else {
                sendErrorResponse(res, error, 500);
            }
        })
        
    } else {
        sendErrorResponse(res, "Bad Request", 400);
    }
});

/**
 * logout
 */
app.get('/logout', function(req, res) {
    console.log("Logging out user");
    req.session.reset();
    res.redirect('/');
});

app.get('/users', function(req, res) {
    userProvider.findAll(function(error, users) {
        console.log(users); 
    });
});

app.get('/users/:username', function(req, res, next) {
    var username = req.params.username;
    
    if (username) {
        var query = {username: username};
        userProvider.find(query, function(error, results) {
            console.log(results);
        });
    }
});

/**
 * add a new user
 */
app.post('/users', function(req, res){
    var params = {};
    
    params.username = (req && req.body && req.body.username) ? req.body.username.toLowerCase() : '',
    params.name = (req && req.body && req.body.name) ? req.body.name : '';
    params.password = (req && req.body && req.body.password) ? req.body.password : '';
        
    if (!params.username || !params.name || !params.password) {
        sendErrorResponse(res, "Bad Request", 400);
    } else {
        // check if username already exists
        console.log("checking if user already exists", {'username': params.username});
        userProvider.find({'username': params.username}, function(error, collection) {
            if (!error) {
                if (collection.length === 0) {
                    console.log("Attempting to add new user", req.body);
                    // insert new record
                    userProvider.save(params, function(error, docs) {
                        if (error) {
                            sendErrorResponse(res, error, 500);
                        } else {
                            console.log("New user was added", params, docs);
                            req.session.signedinUser = params;
                            sendSuccessResponse(res, params);
                        }
                    });
                } else {
                    sendErrorResponse(res, "Already exists", 409);
                }
                
            } else {
                sendErrorResponse(res, error, 500);
            }
        });
        
    }
});

/**
 * Posting new shout
 */
app.post('/shout', function(req, res) {
    var params = {};
    
    params.username = (req && req.body && req.body.username) ? req.body.username.toLowerCase() : '',
    params.content = (req && req.body && req.body.content) ? req.body.content : '';
    
    if (!params.username || !params.content) {
        sendErrorResponse(res, 'Bad Request', 400);
    } else {
        console.log("Adding new shout", params);
        shoutProvider.save(params, function(error, docs) {
            if (error) {
                sendErrorResponse(res, error, 500);
            } else {
                console.log("New shout was added", params, docs);
                sendSuccessResponse(res, params);
            }    
        });
    }
});

app.get('/shout/:username', function(req, res) {
    var username = req.params.username;
    
    if (username) {
        console.log("Searching for shoutout posts of ", username);
        shoutProvider.find({'username': username}, function(error, collection) {
            if (!error) {
                sendSuccessResponse(res, {shoutout: collection});
            } else {
                sendErrorResponse(res, "Bad Request", 400);
            }
        });
    } else {
        sendErrorResponse(res, "Forbidden", 403);
    }
});

app.delete('/shout/:shout_id', function(req, res) {
    var id = req.params.shout_id;
    console.log("Shoutout ID", id);
    if (id) {
        console.log("Attempting to delete shoutout id ", id);
        shoutProvider.deleteById(id, function(error, result) {
           if (!error) {
               sendSuccessResponse(res, {id: id, result: result.result});
           } else {
               sendErrorResponse(res, "Bad Request", 400);
           } 
        });
    } else {
        sendErrorResponse(res, "Forbidden", 403);
    }
})


// Read folder and register each directory
fs.readdir('.', function (err, folders) {
    if (err) throw err;
    folders.forEach(function (folder) {
        app.use('/' + folder, express.static(folder));
    });
});

app.listen(port, function() {
    console.log("Server is app and running on port " + port); 
});