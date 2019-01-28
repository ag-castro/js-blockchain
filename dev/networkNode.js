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
    const newBlock = waapcoin.createNewBlock(nonce, previousBlockHash, blockHash);
    const requestPromises = [];
    waapcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: { newBlock: newBlock },
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
        .then(data => {
            const requestOptions = {
                uri: waapcoin.currentNodeUrl + '/transaction/broadcast',
                method: 'POST',
                body: {
                    amount: 12.5,
                    sender: "00",
                    recipient: nodeAddress
                },
                json: true
            };
            return rp(requestOptions);
        })
        .then(data => {
            res.json({
                note: "New block mined & broadcast successfully.",
                block: newBlock,
            });
        });
});

app.post('/receive-new-block', function (req, res) {
    const newBlock = req.body.newBlock;
    const lastBlock = waapcoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
    if (correctHash && correctIndex) {
        waapcoin.chain.push(newBlock);
        waapcoin.pendingTransactions = [];
        res.json({
            note: 'New Block received and accepted.',
            newBlock: newBlock
        });
    } else {
        res.json({
            note: 'The New block was rejected.',
            newBlock: newBlock
        });
    }
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

app.get('/consensus', function (req, res) {
    const requestPromises = [];
    waapcoin.networkNodes.forEach(networkNodeUrl => {
       const requestOptions = {
           uri: networkNodeUrl + '/blockchain',
           method: 'GET',
           json: true
       };
       requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
        .then(blockchains => {
            let maxChainLength = waapcoin.chain.length;
            let newLongestChain = null;
            let newPendingTransactions = null;
            blockchains.forEach(blockchain => {
                if (blockchain.chain.length > maxChainLength) {
                    maxChainLength = blockchain.chain.length;
                    newLongestChain = blockchain.chain;
                    newPendingTransactions = blockchain.pendingTransactions;
                }
            });
            if (!newLongestChain || (newLongestChain && !waapcoin.chainIsValid(newLongestChain))) {
                res.json({
                    note: 'Current chain has not been replaced.',
                    chain: waapcoin.chain
                })
            } else {
                waapcoin.chain = newLongestChain;
                waapcoin.pendingTransactions = newPendingTransactions;
                res.json({
                    note: 'This chain has been replaced.',
                    chain: waapcoin.chain
                });
            }
        });
});

app.get('/block/:blockHash', function (req, res) {
    const blockHash = req.params.blockHash;
    const correctBlock = waapcoin.getBlock(blockHash);
    res.json({
        block: correctBlock
    });
});

app.get('/transaction/:transactionId', function (req, res) {
    const transactionId = req.params.transactionId;
    const transactionData = waapcoin.getTransaction(transactionId);
    res.json({
        transaction: transactionData.transaction,
        block: transactionData.block
    });
});

app.get('/address/:address', function (req, res) {
    const address = req.params.address;
    const addressData = waapcoin.getAddressData(address);
    res.json({
        addressData: addressData
    });
});

app.get('/block-explorer', function (req, res) {
    res.sendFile('./block-explorer/index.html', { root: __dirname });
});

app.listen(port, function () {
    console.log(`Listening on port ${port}!!!`);
});
