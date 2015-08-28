/*!
 * node-recaptcha
 * Recaptcha v2
 * From: https://github.com/hgGeorg/node-recaptcha/blob/master/lib/recaptcha.js
 */

/**
 * Module dependencies.
 */

var https        = require('https'),
    querystring = require('querystring');

/**
 * Constants.
 */

var API_HOST = 'www.google.com',
    API_END_POINT = '/recaptcha/api/siteverify'

/**
 * Initialize Recaptcha with given `public_key`, `private_key` and optionally
 * `data`.
 *
 * The `data` argument should have the following keys and values:
 *
 *   remoteip:  The IP of the client who submitted the form.
 *   challenge: The value of `recaptcha_challenge_field` from the Recaptcha
 *              form.
 *   response:  The value of `recaptcha_response_field` from the Recaptcha
 *              form.
 *
 * @param {String} public_key Your Recaptcha public key.
 * @param {String} private_key Your Recaptcha private key.
 * @param {Object} data The Recaptcha data to be verified.  See above for
 *                      format.  (optional)
 * @param {Boolean} secure Flag for using https connections to load client-facing things. (optional)
 * @api public
 */

var Recaptcha = exports.Recaptcha = function Recaptcha(public_key, private_key, data, secure) {
    this.public_key = public_key;
    this.private_key = private_key;
    if (typeof(data) == 'boolean'){
        this.data = undefined;
        this.is_secure = data;
    }
    else {
        this.data = data;
        this.is_secure = secure;
    }

    return this;
}

/**
 * Render the Recaptcha fields as HTML.
 *
 * If there was an error during `verify` and the selected Recaptcha theme
 * supports it, it will be displayed.
 *
 * @api public
 */

Recaptcha.prototype.toHTML = function() {
    return "<script src='https://www.google.com/recaptcha/api.js' async defer></script>" +
    "<div class='g-recaptcha' data-sitekey='" + this.public_key + "'></div>" +
    "<noscript><div style='width: 302px; height: 352px;'>" +
    "<div style='width: 302px; height: 352px; position: relative;'>" +
    "<div style='width: 302px; height: 352px; position: absolute;'>" +
    "<iframe src='https://www.google.com/recaptcha/api/fallback?k=" + this.public_key + "'" +
    "frameborder='0' scrolling='no'" +
    "style='width: 302px; height:352px; border-style: none;'></iframe></div>" +
    "<div style='width: 250px; height: 80px; position: absolute; border-style: none;" +
    "bottom: 21px; left: 25px; margin: 0px; padding: 0px; right: 25px;'>" +
    "<textarea id='g-recaptcha-response' name='g-recaptcha-response'" +
    "class='g-recaptcha-response' style='width: 250px; height: 80px; border: 1px solid #c1c1c1; " +
    "margin: 0px; padding: 0px; resize: none;' value=''></textarea></div></div></div></noscript>";
};

/**
 * Verify the Recaptcha response.
 *
 * Example usage:
 *
 *     var recaptcha = new Recaptcha('PUBLIC_KEY', 'PRIVATE_KEY', data);
 *     recaptcha.verify(function(success, error_code) {
 *         if (success) {
 *             // data was valid.  Continue onward.
 *         }
 *         else {
 *             // data was invalid, redisplay the form using
 *             // recaptcha.toHTML().
 *         }
 *     });
 *
 * @param {Function} callback
 * @api public
 */

Recaptcha.prototype.verify = function(callback) {
    var self = this;

    // See if we can declare this invalid without even contacting Recaptcha.
    if (typeof(this.data) === 'undefined') {
        this.error_code = 'verify-params-incorrect';
        return callback('verify-params-incorrect', false);
    }
    if (!('remoteip' in this.data &&
          'response' in this.data))
    {
        this.error_code = 'verify-params-incorrect';
        return callback(false, 'verify-params-incorrect');
    }
    if (this.data.response === '') {
        this.error_code = 'incorrect-captcha-sol';
        return callback('incorrect-captcha-sol', false);
    }

    // Add the private_key to the request.
    this.data['secret'] = this.private_key;
    var data_qs = querystring.stringify(this.data);

    var req_options = {
        host: API_HOST,
        path: API_END_POINT,
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data_qs.length
        }
    };

    var request = https.request(req_options, function(response) {
        var body = '';

        response.on('error', function(err) {
            self.error_code = 'recaptcha-not-reachable';
            callback('recaptcha-not-reachable', false);
        });

        response.on('data', function(chunk) {
            body += chunk;
        });

        response.on('end', function() {
            var result = JSON.parse(body);
            return callback(result["error-codes"], result.success);
        });
    });
    request.write(data_qs, 'utf8');
    request.end();
};
