const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const nosotrosRouter = require('./routes/nosotros');
const adminRouter = require('./routes/admin');

const app = express();

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'drivex-super-secret-key',
  resave: false,
  saveUninitialized: true // debug: true para asegurar sesiones
}));
// Página de contacto
app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "views/contact.html"));
});

// Procesar formulario y redirigir a la página de éxito
app.post("/send-message", (req, res) => {

  const { name, email, message } = req.body;
  console.log("New message:");
  console.log({ name, email, message });

  // Aquí podrías guardar en DB o enviar un correo

  res.redirect("/success");
});

app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "views/success.html"));
});
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/nosotros', nosotrosRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/admin', adminRouter);

app.get('/home', (req, res) => {
  console.log('SESION:', req.session);
  const username = req.session.username || 'usuario';
  res.render('home', { username });
});
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = app;
