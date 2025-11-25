var express = require('express');
var router = express.Router();
const db = require('../db');

function ensureIsAdminColumn(callback) {
  const alterSql = 'ALTER TABLE Users ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0';
  db.query(alterSql, function (alterErr) {
    if (alterErr && alterErr.code !== 'ER_DUP_FIELDNAME') {
      return callback(alterErr);
    }
    return callback();
  });
}

router.post('/', function (req, res, next) {
  var usernameInput = req.body.username;
  var passwordInput = req.body.password;

  if (!usernameInput || !passwordInput) {
    return res.status(400).json({ error: 'A username and a password are required' });
  }

  var normalizedUsername = String(usernameInput).trim().toLowerCase();
  var normalizedPassword = String(passwordInput).trim();

  const query = 'SELECT id, username, password, is_admin FROM Users WHERE LOWER(username) = ? LIMIT 1';

  function runQuery(retried) {
    db.query(query, [normalizedUsername], function (err, results) {
      if (err) {
        if (err.code === 'ER_BAD_FIELD_ERROR' && !retried) {
          return ensureIsAdminColumn(function (ensureErr) {
            if (ensureErr) return next(ensureErr);
            return runQuery(true);
          });
        }
        return next(err);
      }

      if (!results.length) {
        return res.status(401).render('index', { error: 'Usuario o contraseña incorrectos' });
      }

      const user = results[0];
      if (user.password !== normalizedPassword) {
        return res.status(401).render('index', { error: 'Usuario o contraseña incorrectos' });
      }

      req.session.regenerate(function (sessionErr) {
        if (sessionErr) {
          return next(sessionErr);
        }
        req.session.username = user.username;
        req.session.isAdmin = Boolean(user.is_admin);
        return req.session.save(function () {
          return res.redirect(req.session.isAdmin ? '/admin' : '/home');
        });
      });
    });
  }

  runQuery(false);
});

module.exports = router;
