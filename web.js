var express = require('express');
var fs = require('fs');

var app = express();

app.get('/', function(request, response) {
//  response.send('Hello World 2!');
    buf = fs.readFileSync('index.html');
    response.send(buf.toString());
});

app.configure(function(){
    app.use('/js', express.static(__dirname + '/js'));
    app.use('/css', express.static(__dirname + '/css'));
    app.use('/img', express.static(__dirname + '/img'));
});
var port = process.env.PORT || 8888;
app.listen(port, function() {
  console.log("Listening on " + port);
});
