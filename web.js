var express = require('express');
var fs = require('fs');

var app = express();

app.get('/', function(request, response) {
//  response.send('Hello World 2!');
    //fs.readFileSync('index.html');
    fs.readFile('index.html', function(err, data) {
        if (err) throw err;
        response.send(data.toString());
    });
    //response.send(buf.toString());
});

app.get('/index2', function(request, response) {
    fs.readFile('index2.html',function(err, data) {
        if (err) throw err;
        response.send(data.toString());
    });
});

app.configure(function(){
    app.use('/js', express.static(__dirname + '/js'));
    app.use('/css', express.static(__dirname + '/css'));
    app.use('/fonts', express.static(__dirname + '/fonts'));
    app.use('/images', express.static(__dirname + '/images'));
    app.use(express.favicon(__dirname + '/images/favicon.ico'));
});
var port = process.env.PORT || 8888;
app.listen(port, function() {
  console.log("Listening on " + port);
});
