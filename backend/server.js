const express = require('express');
const { getSubscriptions } = require('./blockchainService');
const { Web3 } = require('web3');
const userManagerABI = require('./UserManagerABI.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/subscriptions/:userAddress', async (req, res) => {
    try {
        const userAddress = req.params.userAddress;
        const subscriptions = await getSubscriptions(userAddress);
        res.json(subscriptions);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
