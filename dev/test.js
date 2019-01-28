const Blockchain = require('./blockchain');

const waapcoin = new Blockchain();

const wc1 = {
    "chain": [
    {
        "index": 1,
        "timestamp": 1548643193334,
        "transactions": [],
        "nonce": 100,
        "hash": "0",
        "previousBlockHash": "0"
    },
    {
        "index": 2,
        "timestamp": 1548643227756,
        "transactions": [],
        "nonce": 18140,
        "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
        "previousBlockHash": "0"
    },
    {
        "index": 3,
        "timestamp": 1548643291825,
        "transactions": [
            {
                "amount": 12.5,
                "sender": "00",
                "recipient": "fdbad96022a511e9a5c455ef3faaee9b",
                "transactionId": "124220f022a611e9a5c455ef3faaee9b"
            },
            {
                "amount": 10,
                "sender": "SDF56G1SDF3G65DS",
                "recipient": "1VC9B8N4VBN5V7F8G",
                "transactionId": "2a49407022a611e9a5c455ef3faaee9b"
            },
            {
                "amount": 20,
                "sender": "SDF56G1SDF3G65DS",
                "recipient": "1VC9B8N4VBN5V7F8G",
                "transactionId": "304c8ef022a611e9a5c455ef3faaee9b"
            },
            {
                "amount": 30,
                "sender": "SDF56G1SDF3G65DS",
                "recipient": "1VC9B8N4VBN5V7F8G",
                "transactionId": "33e8a17022a611e9a5c455ef3faaee9b"
            }
        ],
        "nonce": 26923,
        "hash": "0000eb502a77aee6f7fc9af822fc622f29fbcfacecc6f70b0d7fb97ce48cf3bc",
        "previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
    },
    {
        "index": 4,
        "timestamp": 1548643336561,
        "transactions": [
            {
                "amount": 12.5,
                "sender": "00",
                "recipient": "fdbad96022a511e9a5c455ef3faaee9b",
                "transactionId": "386fb03022a611e9a5c455ef3faaee9b"
            },
            {
                "amount": 40,
                "sender": "SDF56G1SDF3G65DS",
                "recipient": "1VC9B8N4VBN5V7F8G",
                "transactionId": "47e9a20022a611e9a5c455ef3faaee9b"
            },
            {
                "amount": 50,
                "sender": "SDF56G1SDF3G65DS",
                "recipient": "1VC9B8N4VBN5V7F8G",
                "transactionId": "4a3fee1022a611e9a5c455ef3faaee9b"
            },
            {
                "amount": 60,
                "sender": "SDF56G1SDF3G65DS",
                "recipient": "1VC9B8N4VBN5V7F8G",
                "transactionId": "4d22749022a611e9a5c455ef3faaee9b"
            },
            {
                "amount": 70,
                "sender": "SDF56G1SDF3G65DS",
                "recipient": "1VC9B8N4VBN5V7F8G",
                "transactionId": "4f6363e022a611e9a5c455ef3faaee9b"
            }
        ],
        "nonce": 8328,
        "hash": "0000c75e8e351d5e2e3407c511bfb067f83f488a7afb9dbf59fad3b98ebbf5e9",
        "previousBlockHash": "0000eb502a77aee6f7fc9af822fc622f29fbcfacecc6f70b0d7fb97ce48cf3bc"
    },
    {
        "index": 5,
        "timestamp": 1548643351557,
        "transactions": [
            {
                "amount": 12.5,
                "sender": "00",
                "recipient": "fdbad96022a511e9a5c455ef3faaee9b",
                "transactionId": "5319b52022a611e9a5c455ef3faaee9b"
            }
        ],
        "nonce": 12841,
        "hash": "000047578bdb1cb002e79617c0813f18601113b4ba06bc536f54fe6c3a4f3c94",
        "previousBlockHash": "0000c75e8e351d5e2e3407c511bfb067f83f488a7afb9dbf59fad3b98ebbf5e9"
    },
    {
        "index": 6,
        "timestamp": 1548643353880,
        "transactions": [
            {
                "amount": 12.5,
                "sender": "00",
                "recipient": "fdbad96022a511e9a5c455ef3faaee9b",
                "transactionId": "5c0a117022a611e9a5c455ef3faaee9b"
            }
        ],
        "nonce": 13314,
        "hash": "000089771f4009d31b93bcf5cd444a73262d83fb02633904e74226eb317537a8",
        "previousBlockHash": "000047578bdb1cb002e79617c0813f18601113b4ba06bc536f54fe6c3a4f3c94"
    }
],
    "pendingTransactions": [
    {
        "amount": 12.5,
        "sender": "00",
        "recipient": "fdbad96022a511e9a5c455ef3faaee9b",
        "transactionId": "5d6c609022a611e9a5c455ef3faaee9b"
    }
],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
};

console.log('VALID:', waapcoin.chainIsValid(wc1.chain));