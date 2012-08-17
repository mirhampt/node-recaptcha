
/**
 * Module dependencies.
 */

var express = require('express'),
    Recaptcha = require('../lib/recaptcha').Recaptcha;

var PUBLIC_KEY  = 'YOUR_PUBLIC_KEY',
    PRIVATE_KEY = 'YOUR_PRIVATE_KEY';


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', function(req, res) {
    var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY);

    res.render('form', {
        layout: false,
        locals: {
            recaptcha_form: recaptcha.toHTML()
        }
    });
});

app.post('/', function(req, res) {
    var data = {
        remoteip:  req.connection.remoteAddress,
        challenge: req.body.recaptcha_challenge_field,
        response:  req.body.recaptcha_response_field
    };
    var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY, data);

    recaptcha.verify(function(success, error_code) {
        if (success) {
            res.send('Recaptcha response valid.');
        }
        else {
            // Redisplay the form.
            res.render('form', {
                layout: false,
                locals: {
                    recaptcha_form: recaptcha.toHTML()
                }
            });
        }
    });
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
