var express = require('express'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    UserProvider = require('./userprovider.js').UserProvider;

var app = new express(),
    port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
    
app.use(function(req, res, next) {
    res.header('X-Frame-Options', 'DENY');
    res.header('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-XSS-Protection', '1; mode=block');
    return next();
});

var userProvider = new UserProvider('localhost', 27017);

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

app.get('/users', function(req, res) {
    userProvider.findAll(function(error, users) {
    //    res.render('index', {
    //        title: 'Users',
    //        users: users
    //    })
    
        console.log(users); 
    });
});

app.get('/users/new', function(req, res) {
   res.render('users_new', {
       title: 'New User'
   }) 
});

app.post('/users', function(req, res){
    console.log("REQ", req.body)
    userProvider.save({
        email: req.body.email,
        name: req.body.name
    }, function(error, docs) {
        // res.redirect('/users');
        console.log("users", docs);
    });
});

app.post('/auth', function(req, res) {
    console.log(req.body);
});

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