const TimeLock = artifacts.require("TimeLock");
const Web3 = require("web3");

contract("TimeLock", (accounts) => {
  let timeLock;
  const owner = accounts[0];
  const beneficiary = accounts[1];
  const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");

  before(async () => {
    timeLock = await TimeLock.deployed();
  });

  it("should queue a transaction", async () => {
    const executionTime = Math.floor(Date.now() / 1000) + 60; // 1 minute in the future
    const data = web3.eth.abi.encodeFunctionCall({
      name: "set",
      type: "function",
      inputs: [{
        type: "uint256",
        name: "x"
      }]
    }, ["42"]);

    const tx = await timeLock.queueTransaction(beneficiary, 0, data, executionTime, { from: owner });
    const txId = tx.logs[0].args.txId;

    console.log("Transaction ID:", txId);
    console.log("Gas Used:", tx.receipt.gasUsed);
    console.log("Transaction Status:", tx.receipt.status);

    const transaction = await web3.eth.getTransaction(tx.tx);
    console.log("Transaction Details:", transaction);
  });

  it("should execute a transaction", async () => {
    const executionTime = Math.floor(Date.now() / 1000) + 60; // 1 minute in the future
    const data = web3.eth.abi.encodeFunctionCall({
      name: "set",
      type: "function",
      inputs: [{
        type: "uint256",
        name: "x"
      }]
    }, ["42"]);

    const tx = await timeLock.queueTransaction(beneficiary, 0, data, executionTime, { from: owner });
    const txId = tx.logs[0].args.txId;

    // Wait for the execution time
    await new Promise(resolve => setTimeout(resolve, 60000));

    const executeTx = await timeLock.executeTransaction(txId, { from: owner });
    console.log("Gas Used:", executeTx.receipt.gasUsed);
    console.log("Transaction Status:", executeTx.receipt.status);

    const transaction = await web3.eth.getTransaction(executeTx.tx);
    console.log("Transaction Details:", transaction);
  });

  it("should cancel a transaction", async () => {
    const executionTime = Math.floor(Date.now() / 1000) + 60; // 1 minute in the future
    const data = web3.eth.abi.encodeFunctionCall({
      name: "set",
      type: "function",
      inputs: [{
        type: "uint256",
        name: "x"
      }]
    }, ["42"]);

    const tx = await timeLock.queueTransaction(beneficiary, 0, data, executionTime, { from: owner });
    const txId = tx.logs[0].args.txId;

    const cancelTx = await timeLock.cancelTransaction(txId, { from: owner });
    console.log("Gas Used:", cancelTx.receipt.gasUsed);
    console.log("Transaction Status:", cancelTx.receipt.status);

    const transaction = await web3.eth.getTransaction(cancelTx.tx);
    console.log("Transaction Details:", transaction);
  });
});