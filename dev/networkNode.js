const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const rp = require('request-promise');
const port = process.argv[2];
const app = express();
const waapcoin = new Blockchain();
const nodeAddress = uuid().split('-').join('');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/blockchain', function (req, res) {
    res.send(waapcoin);
});

app.post('/transaction', function (req, res) {
    const newTransaction = req.body;
    const blockIndex = waapcoin.addTransactionToPendingTransactions(newTransaction);
    res.json({ note: `Transaction will be added in the block ${blockIndex}.` });
});

app.post('/transaction/broadcast', function (req, res) {
    const newTransaction = waapcoin.createNewTransaction(
        req.body.amount, req.body.sender, req.body.recipient
    );
    waapcoin.addTransactionToPendingTransactions(newTransaction);
    const requestPromises = [];
    waapcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
        .then(data => {
           res.json({ note: 'Transaction created and broadcast successfully.' });
        });
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
        note: "New block mined successfully.",
        block: newBlock,
    });
});

app.post('/register-and-broadcast-node', function (req, res) {
    // Register a node and broadcast it the network
    const newNodeUrl = req.body.newNodeUrl;
    if (waapcoin.networkNodes.indexOf(newNodeUrl) === -1) waapcoin.networkNodes.push(newNodeUrl);
    const regNodesPromises = [];
    waapcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        };
        regNodesPromises.push(rp(requestOptions));
        Promise.all(regNodesPromises)
            .then(data => {
                const bulkRegisterOptions = {
                    uri: newNodeUrl + '/register-nodes-bulk',
                    method: 'POST',
                    body: { allNetworkNodes: [
                            ...waapcoin.networkNodes,
                            waapcoin.currentNodeUrl
                        ]},
                    json: true
                };
                return rp(bulkRegisterOptions);
            })
            .then(data => {
                res.json({note: 'New node registered with network successfully.'});
            })
    });
});

app.post('/register-node', function (req, res) {
    // Register a node with the network
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = waapcoin.networkNodes.indexOf(newNodeUrl) === -1;
    const notCurrentNode = waapcoin.currentNodeUrl !== newNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) waapcoin.networkNodes.push(newNodeUrl);
    res.json({ note: 'New node registered successfully' });
});

app.post('/register-nodes-bulk', function (req, res) {
    // Register multiple nodes at once
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = waapcoin.networkNodes.indexOf(networkNodeUrl) === -1;
        const notCurrentNode = waapcoin.currentNodeUrl !== networkNodeUrl;
        if (nodeNotAlreadyPresent && notCurrentNode) waapcoin.networkNodes.push(networkNodeUrl);
    });
    res.json({ note: 'Bulk registration successful.'});
});


app.listen(port, function () {
    console.log(`Listening on port ${port}!!!`)
});
