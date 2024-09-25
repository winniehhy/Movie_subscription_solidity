import contractData from '../../smart_contract/build/contracts/UserManagement.json';

const contractAddress = contractData.networks[5777]?.address;  // smart contract address
const contractABI = contractData.abi; // smart contract's ABI

let web3;
let userManager;

window.addEventListener("load", async () => {
  try {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      userManager = new web3.eth.Contract(contractABI, contractAddress);
      document.getElementById("connectMetaMask").disabled = false;

      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        updateStatus("MetaMask not connected. Please connect to MetaMask.");
      } else {
        updateStatus(`Connected to MetaMask account: ${accounts[0]}`);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask and try again.");
      document.getElementById("connectMetaMask").disabled = true;
    }
  } catch (error) {
    console.error("Error during initialization: ", error);
  }
});

document.getElementById("connectMetaMask").addEventListener("click", async () => {
  try {
    await ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    updateStatus(`Connected to MetaMask account: ${accounts[0]}`);
    document.getElementById("connectMetaMask").innerText = "Connected";
  } catch (error) {
    console.error("Error connecting MetaMask: ", error);
    alert("Failed to connect MetaMask");
  }
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const accounts = await web3.eth.getAccounts();

  if (accounts.length === 0) {
    alert("MetaMask not connected. Please connect to MetaMask.");
    return;
  }

  try {
    updateStatus("Checking registration status...");

    // Check if the user is already registered
    const isRegistered = await userManager.methods
      .isUserRegistered(accounts[0])
      .call();
    if (isRegistered) {
      alert("This account is already registered.");
      return;
    }

    // Check if username is already taken
    const isUsernameTaken = await userManager.methods
      .isUsernameTaken(username)
      .call();
    if (isUsernameTaken) {
      alert("Username is already taken. Please choose a different username.");
      return;
    }

    // Check if email is already taken
    const isEmailTaken = await userManager.methods
      .isEmailTaken(email)
      .call();
    if (isEmailTaken) {
      alert("Email is already registered. Please use a different email.");
      return;
    }

    updateStatus("Submitting registration...");

    // Register the user
    await userManager.methods
      .registerUser(username, email)
      .send({ from: accounts[0], gas: 3000000 })
      .on("transactionHash", function (hash) {
        updateStatus("Transaction sent, waiting for confirmation...");
      })
      .on("receipt", function (receipt) {
        console.log("Transaction confirmed. Receipt: ", receipt);
        updateStatus("Registration successful. Redirecting...");
        window.location.href = "transaction.html"; // Redirect after registration
      })
      .catch(function (error) {
        updateStatus("Registration failed: " + error.message);
      });
  } catch (error) {
    console.error("Transaction failed: ", error);
    updateStatus("Registration failed: " + error.message);
  }
});

function updateStatus(message) {
  document.getElementById("statusMessage").innerText = message;
}
