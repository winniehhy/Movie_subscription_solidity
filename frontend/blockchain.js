document.addEventListener("DOMContentLoaded", async () => {
	if (window.ethereum) {
	  window.web3 = new Web3(window.ethereum);
	  try {
		await window.ethereum.enable();
	  } catch (error) {
		console.error("User denied account access");
	  }
	} else if (window.web3) {
	  window.web3 = new Web3(window.web3.currentProvider);
	} else {
	  console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
	}
  
	const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your contract address
	const contractABI = [/* YOUR_CONTRACT_ABI */]; // Replace with your contract ABI
  
	window.contract = new web3.eth.Contract(contractABI, contractAddress);
  });

  document.getElementById("connectButton").addEventListener("click", async () => {
	if (window.ethereum) {
	  try {
		await window.ethereum.enable();
		console.log("Wallet connected");
	  } catch (error) {
		console.error("User denied account access");
	  }
	}
  });

  document.getElementById("queueTransactionForm").addEventListener("submit", async (event) => {
	event.preventDefault();
  
	const contractAddress = document.getElementById("contractAddress").value;
	const functionCall = document.getElementById("functionCall").value;
	const parameters = document.getElementById("parameters").value.split(",");
	const executionDate = new Date(document.getElementById("executionDate").value).getTime() / 1000;
  
	const accounts = await web3.eth.getAccounts();
	const txData = web3.eth.abi.encodeFunctionCall({
	  name: functionCall,
	  type: 'function',
	  inputs: parameters.map(param => ({ type: 'string', name: param }))
	}, parameters);
  
	try {
	  await window.contract.methods.queueTransaction(contractAddress, 0, txData, executionDate).send({ from: accounts[0] });
	  console.log("Transaction queued");
	} catch (error) {
	  console.error("Error queuing transaction", error);
	}
  });

  document.getElementById("executeTransactionsButton").addEventListener("click", async () => {
	const accounts = await web3.eth.getAccounts();
  
	// Fetch all transactions and execute the due ones
	const transactionIds = await window.contract.methods.getTransactionIds().call();
	for (const txId of transactionIds) {
	  const transaction = await window.contract.methods.transactions(txId).call();
	  if (transaction.executionTime <= Math.floor(Date.now() / 1000) && !transaction.executed && !transaction.canceled) {
		try {
		  await window.contract.methods.executeTransaction(txId).send({ from: accounts[0] });
		  console.log(`Transaction ${txId} executed`);
		} catch (error) {
		  console.error(`Error executing transaction ${txId}`, error);
		}
	  }
	}
  });