require("dotenv").config();
var express = require("express");
var app = express();
var path = require("path");
var randomstring = require("randomstring");
var bodyParser = require("body-parser");
var flash = require("express-flash-messages");
var mysql = require("mysql");
const { check, validationResult } = require("express-validator");
var session = require("express-session");
var port = process.env.PORT || 8000;
var router = express.Router();
var randomstring = require("randomstring");
var cookieParser = require("cookie-parser");
var db_host = process.env.HOST;
var db_password = process.env.password;

app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
// Express session
app.use(cookieParser());
// Express session
app.use(
  session({
    secret: randomstring.generate(),
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());
router.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});
app.use(express.static(path.join(__dirname, "public"))); //  "public" off of current is root

//DB CONNECTION
var con = mysql.createConnection({
  host: db_host,
  user: "urlshortner",
  port: "3306",
  password: db_password,
  database: "urlshortner",
});

con.connect(function (err) {
  if (err) {
    console.log(err);
  }
  console.log("Connected!");
});

//RENDER HOMEPAGE
app.get("/", function (req, res) {
  res.render("index", {
    message: req.flash("message"),
    email: req.session.email,
  });
});

//LOGIN
app.get("/login", function (req, res) {
  res.render("login");
});

// LOGIN BACKEND
app.post("/login", function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  con.query(
    "SELECT * FROM users WHERE email = '" +
      email +
      "' AND password = '" +
      password +
      "'",
    function (err, result, fields) {
      if (err) throw err;
      if (result != "") {
        req.session.email = result[0].email;
        res.redirect("/");
      } else {
        console.log("Failed Login");
      }
    }
  );
});

//SIGNUP
app.get("/signup", function (req, res) {
  res.render("signup");
});

// Sinup BACKEND
app.post("/signup", function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var sql =
    "INSERT INTO users (email, password) VALUES ('" +
    email +
    "', '" +
    password +
    "')";
  con.query(sql, function (err, result) {
    req.session.email = result[0].email;
    res.redirect("/");
  });
});

//user urls
app.get("/urls", function (req, res) {
    con.query(
      "SELECT * FROM urls WHERE user = '" + req.session.email + "'",
      function (err, result, fields) {
          if(err) {
              console.log(err)
          }
        res.render("urls", {
          data: result,
          email: req.session.email
        });
      }
    );
});

//SHORTEN URL
app.post("/add/url", [check("url").isURL()], (req, res) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect("/");
  }
  var url = req.body.url;
  var url_string = randomstring.generate({
    length: 5,
    charset: "alphanumeric",
  });
  var sql =
    "INSERT INTO urls (url, url_value, user) VALUES ('" +
    url +
    "', '" +
    url_string +
    "', '" +  
    req.session.email +
    "')";
  con.query(sql, function (err, result) {
    if (err){ 
        console.log(err)
    }
    res.render("show_url", {
      url: url,
      url_value: url_string,
      email: req.session.email,
    });
  });
});

app.get("/signout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

//GET UrL
app.get("/:value", function (req, res) {
  con.query(
    "SELECT * FROM urls WHERE url_value = '" + req.params.value + "'",
    function (err, result, fields) {
      res.render("url", {
        data: result,
      });
    }
  );
});

app.listen(port, "0.0.0.0", function () {
  console.log("Listening on Port 8000");
});
