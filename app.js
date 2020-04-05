var express = require("express");
var app = express();
var path = require('path');
var randomstring = require("randomstring");
var bodyParser = require("body-parser");
var flash = require('express-flash-messages');
var mysql = require("mysql");
const { check, validationResult } = require('express-validator');
var session = require('express-session');
var port = process.env.PORT || 8000;
var router = express.Router();
var cookieParser = require('cookie-parser')
app.set("view engine", "ejs");
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
// Express session
app.use(cookieParser());
// Express session
app.use(
    session({
        secret: 'assadasdawqewqdwas123',
        resave: false,
        saveUninitialized: true
    })
);

app.use(flash());
router.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    next();
});



app.use(express.static(path.join(__dirname, 'public'))); //  "public" off of current is root

//DB CONNECTION
var con = mysql.createConnection({
    host: "13.58.247.58",
    user: "urlshortner",
    port: "3306",
    password: "Hitman47@gmail.com",
    database: "urlshortner"
});

con.connect(function (err) {
    if (err) {
        console.log(err)
    }
    console.log("Connected!");
});

//RENDER HOMEPAGE
app.get('/', function (req, res) {
    res.render('index', {
        message: req.flash("message")
    })
})


//SHORTEN URL
app.post(
    '/add/url',
    [
        check('url').isURL()
    ],
    (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.redirect('/')
        }
        var url = req.body.url;
        var url_string = randomstring.generate({
            length: 5,
            charset: 'alphanumeric'
        });
        var sql =
            "INSERT INTO urls (url, url_value) VALUES ('" +
            url +
            "', '" +
            url_string +
            "')";
        con.query(sql, function (err, result) {
            if (err);
            res.render("show_url", {
                url: url,
                url_value: url_string
            })
        });
    });

//GET UrL
app.get('/:value', function (req, res) {
    con.query(
        "SELECT * FROM urls WHERE url_value = '" + req.params.value + "'",
        function (err, result, fields) {
            res.render("url", {
                data: result
            });
        }
    );
});

app.listen(port, "0.0.0.0", function () {
    console.log("Listening on Port 8000");
});