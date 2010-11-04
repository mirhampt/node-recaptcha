var Recaptcha   = require(__dirname + '/lib/recaptcha').Recaptcha,
    http        = require('http'),
    events      = require('events'),
    querystring = require('querystring');

exports['Recaptcha construction https'] = function(test) {
    var recaptcha = new Recaptcha('PUBLIC', 'PRIVATE', true);

    test.strictEqual(recaptcha.public_key, 'PUBLIC', 'public_key is set');
    test.strictEqual(recaptcha.private_key, 'PRIVATE', 'private_key is set');
    test.strictEqual(recaptcha.is_secure, true, 'is_secure is set');
    test.strictEqual(recaptcha.data, undefined, 'data is undefined');
    test.done();
};

exports['Recaptcha construction'] = function(test) {
    var recaptcha = new Recaptcha('PUBLIC', 'PRIVATE');

    test.strictEqual(recaptcha.public_key, 'PUBLIC', 'public_key is set');
    test.strictEqual(recaptcha.private_key, 'PRIVATE', 'private_key is set');
    test.strictEqual(recaptcha.is_secure, undefined, 'is_secure is not set');
    test.strictEqual(recaptcha.data, undefined, 'data is undefined');
    test.done();
};

exports['toHTML() with no error'] = function(test) {
    var recaptcha = new Recaptcha('PUBLIC', 'PRIVATE');
    var script_src = 'http://www.google.com/recaptcha/api/challenge?k=PUBLIC';
    var noscript_src = 'http://www.google.com/recaptcha/api/noscript?k=PUBLIC';

    var expected_html = '<script type="text/javascript" src="' + script_src + '">' +
                        '</script><noscript><iframe src="' + noscript_src + '" ' +
                        'height="300" width="500" frameborder="0"></iframe><br>' +
                        '<textarea name="recaptcha_challenge_field" rows="3" cols="40">' +
                        '</textarea><input type="hidden" name="recaptcha_response_field" ' +
                        'value="manual_challenge"></noscript>';

    test.strictEqual(recaptcha.toHTML(), expected_html, 'toHTML() returns expected HTML');
    test.done();
};

exports['toHTML() https with no error'] = function(test) {
    var recaptcha = new Recaptcha('PUBLIC', 'PRIVATE', true);
    var script_src = 'https://www.google.com/recaptcha/api/challenge?k=PUBLIC';
    var noscript_src = 'https://www.google.com/recaptcha/api/noscript?k=PUBLIC';

    var expected_html = '<script type="text/javascript" src="' + script_src + '">' +
                        '</script><noscript><iframe src="' + noscript_src + '" ' +
                        'height="300" width="500" frameborder="0"></iframe><br>' +
                        '<textarea name="recaptcha_challenge_field" rows="3" cols="40">' +
                        '</textarea><input type="hidden" name="recaptcha_response_field" ' +
                        'value="manual_challenge"></noscript>';

    test.strictEqual(recaptcha.toHTML(), expected_html, 'toHTML() https returns expected HTML');
    test.done();
};

exports['toHTML() with error'] = function(test) {
    var recaptcha = new Recaptcha('PUBLIC', 'PRIVATE');
    recaptcha.error_code = 'ERROR';  // Fake an error.

    var script_src = 'http://www.google.com/recaptcha/api/challenge?k=PUBLIC&error=ERROR';
    var noscript_src = 'http://www.google.com/recaptcha/api/noscript?k=PUBLIC&error=ERROR';

    var expected_html = '<script type="text/javascript" src="' + script_src + '">' +
                        '</script><noscript><iframe src="' + noscript_src + '" ' +
                        'height="300" width="500" frameborder="0"></iframe><br>' +
                        '<textarea name="recaptcha_challenge_field" rows="3" cols="40">' +
                        '</textarea><input type="hidden" name="recaptcha_response_field" ' +
                        'value="manual_challenge"></noscript>';

    test.strictEqual(recaptcha.toHTML(), expected_html, 'toHTML() returns expected HTML');
    test.done();
};

exports['toHTML() https with error'] = function(test) {
    var recaptcha = new Recaptcha('PUBLIC', 'PRIVATE', true);
    recaptcha.error_code = 'ERROR';  // Fake an error.

    var script_src = 'https://www.google.com/recaptcha/api/challenge?k=PUBLIC&error=ERROR';
    var noscript_src = 'https://www.google.com/recaptcha/api/noscript?k=PUBLIC&error=ERROR';

    var expected_html = '<script type="text/javascript" src="' + script_src + '">' +
                        '</script><noscript><iframe src="' + noscript_src + '" ' +
                        'height="300" width="500" frameborder="0"></iframe><br>' +
                        '<textarea name="recaptcha_challenge_field" rows="3" cols="40">' +
                        '</textarea><input type="hidden" name="recaptcha_response_field" ' +
                        'value="manual_challenge"></noscript>';

    test.strictEqual(recaptcha.toHTML(), expected_html, 'toHTML() https returns expected HTML');
    test.done();
};

exports['verify() with no data'] = function(test) {
    var recaptcha = new Recaptcha('PUBLIC', 'PRIVATE');
    var create_client_called = false;

    // We shouldn't need to contact Recaptcha to know this is invalid.
    http.createClient = function(port, host) {
        create_client_called = true;
    };

    recaptcha.verify(function(success, error_code) {
        test.strictEqual(success, false);
        test.strictEqual(error_code, 'verify-params-incorrect');
        test.strictEqual(recaptcha.error_code, 'verify-params-incorrect');

        // Ensure that http.createClient() was never called.
        test.strictEqual(create_client_called, false);

        test.done();
    });
};

exports['verify() with blank response'] = function(test) {
    var data = {
        remoteip: '127.0.0.1',
        challenge: 'challenge',
        response: ''
    };
    var recaptcha = new Recaptcha('PUBLIC', 'PRIVATE', data);
    var create_client_called = false;

    // We shouldn't need to contact Recaptcha to know this is invalid.
    http.createClient = function(port, host) {
        create_client_called = true;
    };

    recaptcha.verify(function(success, error_code) {
        test.strictEqual(success, false);
        test.strictEqual(error_code, 'incorrect-captcha-sol');
        test.strictEqual(recaptcha.error_code, 'incorrect-captcha-sol');

        // Ensure that http.createClient() was never called.
        test.strictEqual(create_client_called, false);

        test.done();
    });
};

exports['verify() with missing remoteip'] = function(test) {
    var data = {
        challenge: 'challenge',
        response: 'response'
    };
    var recaptcha = new Recaptcha('PUBLIC', 'PRIVATE', data);
    var create_client_called = false;

    // We shouldn't need to contact Recaptcha to know this is invalid.
    http.createClient = function(port, host) {
        create_client_called = true;
    };

    recaptcha.verify(function(success, error_code) {
        test.strictEqual(success, false);
        test.strictEqual(error_code, 'verify-params-incorrect');
        test.strictEqual(recaptcha.error_code, 'verify-params-incorrect');

        // Ensure that http.createClient() was never called.
        test.strictEqual(create_client_called, false);

        test.done();
    });
};

exports['verify() with missing challenge'] = function(test) {
    var data = {
        remoteip: '127.0.0.1',
        response: 'response'
    };
    var recaptcha = new Recaptcha('PUBLIC', 'PRIVATE', data);
    var create_client_called = false;

    // We shouldn't need to contact Recaptcha to know this is invalid.
    http.createClient = function(port, host) {
        create_client_called = true;
    };

    recaptcha.verify(function(success, error_code) {
        test.strictEqual(success, false);
        test.strictEqual(error_code, 'verify-params-incorrect');
        test.strictEqual(recaptcha.error_code, 'verify-params-incorrect');

        // Ensure that http.createClient() was never called.
        test.strictEqual(create_client_called, false);

        test.done();
    });
};

exports['verify() with missing response'] = function(test) {
    var data = {
        remoteip: '127.0.0.1',
        challenge: 'challenge',
    };
    var recaptcha = new Recaptcha('PUBLIC', 'PRIVATE', data);
    var create_client_called = false;

    // We shouldn't need to contact Recaptcha to know this is invalid.
    http.createClient = function(port, host) {
        create_client_called = true;
    };

    recaptcha.verify(function(success, error_code) {
        test.strictEqual(success, false);
        test.strictEqual(error_code, 'verify-params-incorrect');
        test.strictEqual(recaptcha.error_code, 'verify-params-incorrect');

        // Ensure that http.createClient() was never called.
        test.strictEqual(create_client_called, false);

        test.done();
    });
};

exports['verify() with bad data'] = function(test) {
    var data = {
        remoteip:  '127.0.0.1',
        challenge: 'challenge',
        response:  'bad_response'
    };
    var recaptcha = new Recaptcha('PUBLIC', 'PRIVATE', data);

    var data_with_pk = {
        remoteip:   data['remoteip'],
        challenge:  data['challenge'],
        response:   data['response'],
        privatekey: 'PRIVATE'
    };

    var response_data = 'false\nincorrect-captcha-sol';
    var data_qs = querystring.stringify(data_with_pk);
    var end_called = false;
    var write_called = false;

    // Stub out communication with Recaptcha.
    var fake_client = {};
    var fake_request = new events.EventEmitter();
    var fake_response = new events.EventEmitter();

    http.createClient = function(port, host) {
        test.strictEqual(port, 80, 'port correct in createClient() call');
        test.strictEqual(host, 'www.google.com', 'host correct in createClient() call');
        return fake_client;
    };
    fake_client.request = function(method, end_point, headers) {
        test.strictEqual(method, 'POST', 'method correct in request() call');
        test.strictEqual(end_point, '/recaptcha/api/verify', 'end_point correct in request() call');
        test.deepEqual(headers, {
            host:             'www.google.com',
            'Content-Length': data_qs.length,
            'Content-Type':   'application/x-www-form-urlencoded'
        }, 'headers correct in request() call');
        return fake_request;
    };
    fake_request.write = function(data, encoding) {
        test.strictEqual(data, data_qs, 'data correct in request.write() call');
        test.strictEqual(encoding, 'utf8', 'encoding correct in request.write() call');
        write_called = true;
    };
    fake_request.end = function() { end_called = true; };

    // Check callback values for verify.
    recaptcha.verify(function(success, error_code) {
        test.strictEqual(success, false, 'success is false');
        test.strictEqual(error_code, 'incorrect-captcha-sol', 'error_code is correct');
        test.strictEqual(recaptcha.error_code,  'incorrect-captcha-sol', 'recaptcha.error_code is set');

        // Make sure that request.write() and request.end() were called.
        test.strictEqual(write_called, true, 'request.write() was called');
        test.strictEqual(end_called, true, 'request.end() was called');
        
        test.done();
    });

    // Emit the signals to mimic getting data from Recaptcha.
    fake_request.emit('response', fake_response);
    fake_response.emit('data', response_data);
    fake_response.emit('end');
};

exports['verify() with good data'] = function(test) {
    var data = {
        remoteip:  '127.0.0.1',
        challenge: 'challenge',
        response:  'good_response'
    };
    var recaptcha = new Recaptcha('PUBLIC', 'PRIVATE', data);

    var data_with_pk = {
        remoteip:   data['remoteip'],
        challenge:  data['challenge'],
        response:   data['response'],
        privatekey: 'PRIVATE'
    };

    var response_data = 'true';
    var data_qs = querystring.stringify(data_with_pk);
    var end_called = false;
    var write_called = false;

    // Stub out communication with Recaptcha.
    var fake_client = {};
    var fake_request = new events.EventEmitter();
    var fake_response = new events.EventEmitter();

    http.createClient = function(port, host) {
        test.strictEqual(port, 80, 'port correct in createClient() call');
        test.strictEqual(host, 'www.google.com', 'host correct in createClient() call');
        return fake_client;
    };
    fake_client.request = function(method, end_point, headers) {
        test.strictEqual(method, 'POST', 'method correct in request() call');
        test.strictEqual(end_point, '/recaptcha/api/verify', 'end_point correct in request() call');
        test.deepEqual(headers, {
            host:             'www.google.com',
            'Content-Length': data_qs.length,
            'Content-Type':   'application/x-www-form-urlencoded'
        }, 'headers correct in request() call');
        return fake_request;
    };
    fake_request.write = function(data, encoding) {
        test.strictEqual(data, data_qs, 'data correct in request.write() call');
        test.strictEqual(encoding, 'utf8', 'encoding correct in request.write() call');
        write_called = true;
    };
    fake_request.end = function() { end_called = true; };

    // Check callback values for verify.
    recaptcha.verify(function(success, error_code) {
        test.strictEqual(success, true, 'success is true');
        test.strictEqual(error_code, undefined, 'error_code is undefined');
        test.strictEqual(recaptcha.error_code, undefined, 'recaptcha.error_code is undefined');

        // Make sure that request.write() and request.end() were called.
        test.strictEqual(write_called, true, 'request.write() was called');
        test.strictEqual(end_called, true, 'request.end() was called');
        
        test.done();
    });

    // Emit the signals to mimic getting data from Recaptcha.
    fake_request.emit('response', fake_response);
    fake_response.emit('data', response_data);
    fake_response.emit('end');
};
