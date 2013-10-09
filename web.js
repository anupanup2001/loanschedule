/*jslint node: true */
var express = require('express');
var fs = require('fs');
var needle = require('needle');
var app = express();
var nodemailer = require('nodemailer');
//console.log(process.env.FBMAILP);
app.use(express.bodyParser());
app.get('/', function(request, response) {
//  response.send('Hello World 2!');
    //fs.readFileSync('index.html');
    fs.readFile('index.html', function(err, data) {
        if (err) {throw err;}
        response.send(data.toString());
    });
    //response.send(buf.toString());
});

app.get('/index2', function(request, response) {
    fs.readFile('index.html',function(err, data) {
        if (err) {throw err;}
        response.send(data.toString());
    });
});

app.get('/loanplanner', function(request, response) {
    fs.readFile('loanplanner.html', function(err, data){
        if (err) {throw err;}
        response.send(data.toString());
    });
});

app.get('/contact', function(request, response) {
    fs.readFile('contact.html', function(err, data) {
        if (err) {throw err;}
        response.send(data.toString());
    });
});

app.get('/about', function(request, response) {
    fs.readFile('about.html', function(err, data) {
        if (err) {throw err;}
        response.send(data.toString());
    });
});

app.get('/Sitemap', function(request, response) {
    fs.readFile('Sitemap.xml', function(err, data) {
        if (err) {throw err;}
        response.send(data.toString());
    });
});

app.post('/sendEmail', function(request, response) {
    //console.log(request.body);
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    //console.log("Ip = " + ip);
    var postData = {
        privatekey: process.env.CAPTCHA_KEY || "wrong",
        remoteip: ip,
        challenge: request.body.challenge,
        response: request.body.response
    };
    needle.post('http://www.google.com/recaptcha/api/verify', postData, function(err, resp, body){
        if(err) {
            throw err;
        }
        if(body.replace(/\n/g, " ").split(" ")[0] == "true") {
            //Captcha successful and hence send mail
            var smtpTransport = nodemailer.createTransport("SMTP", {
                host: "smtp.aidoslabs.com",
                port: 465,
                secureConnection: true,
                auth: {
                    user: "sales@aidoslabs.com",
                    pass: process.env.FBMAILP || "wrong"
                },
                debug: false
            });
            
            var mailOptions = {
                from: "Aidoslabs Sales <sales@aidoslabs.com>",
                to: "feedback@aidoslabs.com",
                subject: "[Feedback]",
                //text: "Hello World",
                html: "Name: " + request.body.name + "<br>" +
                    "Email Id: " + request.body.email + "<br>" +
                    "Feedback: " + request.body.message.replace(/\n/g, "<br>")
            };
            
            smtpTransport.sendMail(mailOptions, function(error, resp){
                if (error) {
                    //Error sending mail. Inform client.
                    response.end("false\n" + error);
                }
                else {
                    console.log("Message Sent: " + response.message );
                    response.end(body);
                }
            });
                    
        }
        else {
        //Send response back to client
            response.end(body);
        }
        
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
