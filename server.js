var express = require("express");
var favicon = require('serve-favicon');
var path = require('path');
var app = express();



app.use(express.static("public"));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set("view engine", "ejs");

app.listen(3000, function() {
    console.log("Server listening on port 3000.");
});


app.get("/", function(req, res) {
    res.render("index");
});