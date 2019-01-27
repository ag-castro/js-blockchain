const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');

const app = express();
const waapcoin = new Blockchain();
const nodeAddress = uuid().split('-').join('');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/blockchain', function (req, res) {
    res.send(waapcoin);
});

app.post('/transaction', function (req, res) {
    const blockIndex = waapcoin.createNewTransaction(
        req.body.amount, req.body.sender, req.body.recipient
    );
    res.json({note: `Transaction will be added in block ${blockIndex}.`});
});

app.get('/mine', function (req, res) {
    const lastBlock = waapcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: waapcoin.pendingTransactions,
        index: lastBlock['index'] + 1
    };
    const nonce = waapcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = waapcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
    waapcoin.createNewTransaction(12.5, "00", nodeAddress);
    const newBlock = waapcoin.createNewBlock(nonce, previousBlockHash, blockHash);
    res.json({
        note: "New block mined successuflly.",
        block: newBlock,
    });
});

app.listen(3000, function () {
    console.log('Listening on port 3000!!!')
});
