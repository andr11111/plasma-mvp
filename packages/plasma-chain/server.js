const express = require('express');
const contractAPI = require('root-chain');
const PlasmaChain = require('./PlasmaChain');
const Transaction = require('./Transaction');
const config = require('./config');

var app = express();
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
let plasma;

app.post("/apply_tx", (req, res) => {
  const txRLP = req.body.data;
  try {
    plasma.applyTransaction(txRLP);
    res.send(`Success`);
  } catch(e) {
    res.send(`Error: ${e.message}`);
  }
});

app.post("/submit_block", (req, res) => {
  const blockRLP = req.body.data;
  try {
    plasma.submitBlock(blockRLP);
    res.send(`Success`);
  } catch(e) {
    res.send(`Error: ${e.message}`);
  }
});

app.get("/current_block", (req, res) => {
  const currentBlockRLP = plasma.getCurrentBlock();
  res.send(currentBlockRLP);
});

app.get("/block/:blockNum/transaction/:txIndex", (req, res) => {
  const { blockNum, txIndex } = req.params;
  const txRLP = plasma.getTransaction(blockNum, txIndex);
  res.send(txRLP);
});

app.get("/block/:blockNum", (req, res) => {
  const { blockNum } = req.params;
  const blockRLP = plasma.getBlock(blockNum);
  res.send(blockRLP);
});

app.get("/current_block_num", (req, res) => {
  const blockNum = plasma.getCurrentBlockNum();
  res.send(blockNum);
});

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

contractAPI(config.rootNodeUrl).then((rootChain) => {
  plasma = new PlasmaChain(config.authority, rootChain);
  const port = 9545;
  app.listen(port, () => console.log(`Plasma chain started. Server listening on port ${port}.`));      
}).catch((e) => {
  console.error("Error:", e.message);  
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
