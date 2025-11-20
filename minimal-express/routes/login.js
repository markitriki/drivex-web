var express = require('express');
var router = express.Router();

var ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin@drivex.com';
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

router.post('/', function (req, res, next) {
  var usernameInput = req.body.username;
  var passwordInput = req.body.password;

  if (!usernameInput || !passwordInput) {
    return res.status(400).json({ error: 'A username and a password are required' });
  }
  var normalizedUsername = String(usernameInput).trim().toLowerCase();
  var normalizedPassword = String(passwordInput).trim();

  var isAdminCredentials =
    normalizedUsername === ADMIN_USERNAME.toLowerCase() &&
    normalizedPassword === ADMIN_PASSWORD;

  req.session.regenerate(function (err) {
    if (err) {
      return next(err);
    }
    req.session.username = normalizedUsername;
    req.session.isAdmin = isAdminCredentials;
    return req.session.save(function () {
      return res.redirect(isAdminCredentials ? '/admin' : '/home');
    });
  });
});

module.exports = router;
