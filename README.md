# node-recaptcha

node-recaptcha renders and verifies [Recaptcha](http://www.google.com/recaptcha) captchas.

**NOTE**: This release currently only supports Recaptcha [version 1](https://developers.google.com/recaptcha/old/intro).

## Installation

Via git:

    $ git clone git://github.com/mirhampt/node-recaptcha.git ~/.node_libraries/node-recaptcha

Via npm:

    $ npm install recaptcha

## Setup

Before you can use this module, you must visit http://www.google.com/recaptcha
to request a public and private API key for your domain.

## Running the Tests

To run the tests for this module, you will first need to install
[nodeunit](http://github.com/caolan/nodeunit).  Then, simply run:

    $ nodeunit test.js

## Customizing the Recaptcha

See these [instructions](https://developers.google.com/recaptcha/old/docs/customization)
for help customizing the look of Recaptcha.  In brief, you will need to add a
structure like the following before the form in your document:

    <script type="text/javascript">
        var RecaptchaOptions = {
           theme : 'clean',
           lang  : 'en'
        };
    </script>

## Example Using [Express](http://www.expressjs.com)

app.js:

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

views/form.jade:

    form(method='POST', action='.')
      != recaptcha_form

      input(type='submit', value='Check Recaptcha')

Make sure [express](http://www.expressjs.com) and [jade](http://jade-lang.com)
are installed, then:

    $ node app.js
