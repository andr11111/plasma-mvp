var express = require('express');
const contractAPI = require('../root-chain/api');
const PlasmaChain = require('./PlasmaChain');

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
let plasma;

const childChainAddress = "0x44a7d4d57545a593645dc6cfb3a526a13cf699a4";

app.get("/test", (req, res) => {

  console.log("test request");

  if (plasma) {
    plasma.submitCurrentBlock().then(() => {
      console.log("after submit block");

      res.send({
        hello: "world1 " + Math.floor(Math.random() * 1000)
      })
    });
  }

});

contractAPI('http://localhost:7545').then((chain) => {
//  console.log("chain = ", chain);
  plasma = new PlasmaChain(childChainAddress, chain);
//  console.log("plasma = ", plasma);

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
//  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err.stack);

  // render the error page
  res.status(err.status || 500).send(err.message);
//  res.send("error happened: ", err.message);
//  res.render('error');

});

module.exports = app;
