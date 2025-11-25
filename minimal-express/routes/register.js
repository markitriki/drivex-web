const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    res.render('registro');
});

router.post('/', (req, res) => {
    console.log('POST received:', req.body);

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send('Username, email y contraseña son obligatorios');
    }

    const sql = 'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username.trim(), email.trim(), password], (err, results) => {
        if (err) {
            console.error('DB error:', err);
            return res.status(500).send('Database error');
        }

        console.log('User inserted:', results);
        res.render('registro_exito', { username });
    });
});

module.exports = router;
