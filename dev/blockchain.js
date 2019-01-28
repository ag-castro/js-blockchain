const sha256 = require('sha256');
const uuid = require('uuid/v1');

const currentNodeUrl = process.argv[3];

function Blockchain() {
    // Blockchain constructor function
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];
    this.createNewBlock(100, '0', '0');
}

Blockchain.prototype.createNewBlock = function (nonce, previousBlockHash, hash) {
    // Create a new Block
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash,
    };
    this.pendingTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
};

Blockchain.prototype.getLastBlock = function () {
    // Return the last block
    return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
    // Create a new transaction
    return {
        amount: amount,
        sender: sender,
        recipient: recipient,
        transactionId: uuid().split('-').join('')
    };
};

Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
    this.pendingTransactions.push(transactionObj);
    return this.getLastBlock()['index'] + 1;
};

Blockchain.prototype.hashBlock = function (previousBlockHash, currentBlockData, nonce) {
    // The Block Data Hasher.
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
};

Blockchain.prototype.proofOfWork = function (previousBlockHash, currentBlockData) {
    // Proof of Work generator
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while (hash.substring(0, 4) !== '0000') {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }
    return nonce;
};

module.exports = Blockchain;