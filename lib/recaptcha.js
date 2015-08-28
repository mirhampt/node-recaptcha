
var v1 = require('./v1'),
var v2 = require('./v2');

exports.Recaptcha = v1.Recaptcha;

exports.v1 = exports.RecaptchaV1 = v1.Recaptcha;
exports.v2 = exports.RecaptchaV2 = v2.Recaptcha;
