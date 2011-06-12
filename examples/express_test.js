var express  = require('express'),
    Recaptcha = require('recaptcha').Recaptcha;

var PUBLIC_KEY  = 'YOUR_PUBLIC_KEY',
    PRIVATE_KEY = 'YOUR_PRIVATE_KEY';

var app = express.createServer();

app.configure(function() {
    app.use(express.bodyParser());
});

app.get('/', function(req, res) {
    var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY);

    res.render('form.jade', {
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
            res.render('form.jade', {
                layout: false,
                locals: {
                    recaptcha_form: recaptcha.toHTML()
                }
            });
        }
    });
});

app.listen(3000);
