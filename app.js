var express = require('express'),
    fs = require('fs');

var app = new express(),
    port = process.env.PORT || 4000;

app.get('/', function(req, res) {
    fs.readFile("index.html", "binary", function(err, file) {
        if(err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            res.write(err + "\n");
            res.end();
            return;
        }
        
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(file, "binary");
        res.end();
        
    });
});

app.listen(port, function() {
    console.log("Server is app and running on port " + port); 
});