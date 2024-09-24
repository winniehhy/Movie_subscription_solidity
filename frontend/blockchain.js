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

  const Web3 = require('web3');
const web3 = new Web3(window.ethereum);

const userManagerABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "username",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "email",
          "type": "string"
        }
      ],
      "name": "ProfileUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "movieTitle",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "subscriptionDate",
          "type": "uint256"
        }
      ],
      "name": "SubscriptionAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "UserLoggedIn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "UserLoggedOut",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "username",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "email",
          "type": "string"
        }
      ],
      "name": "UserRegistered",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "loggedIn",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "subscriptionHistory",
      "outputs": [
        {
          "internalType": "string",
          "name": "movieTitle",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "subscriptionDate",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "users",
      "outputs": [
        {
          "internalType": "string",
          "name": "username",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "lastUpdated",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "username",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        }
      ],
      "name": "registerUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "login",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "logout",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_newUsername",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_newEmail",
          "type": "string"
        }
      ],
      "name": "updateProfile",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_movieTitle",
          "type": "string"
        }
      ],
      "name": "addSubscription",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getProfile",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSubscriptionHistory",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "movieTitle",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "subscriptionDate",
              "type": "uint256"
            }
          ],
          "internalType": "struct UserManager.Subscription[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];  // ABI array from compiled contract
const userManagerAddress = '0xYourContractAddressHere';
const userManagerContract = new web3.eth.Contract(userManagerABI, userManagerAddress);

window.web3 = web3;
window.userManagerContract = userManagerContract;
