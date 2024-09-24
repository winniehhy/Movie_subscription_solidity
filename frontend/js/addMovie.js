import contractData from '../../smart_contract/build/contracts/UserManager.json';
const contractAddress = contractData.networks[5777]?.address;  // smart contract address
const contractABI = contractData.abi; 
let web3;
let userManager;

window.addEventListener('load', async () => {
if (window.ethereum) {
web3 = new Web3(window.ethereum);
await window.ethereum.enable(); // Request access to MetaMask

try {
    const response = await fetch('../UserManagerABI.json'); // Fetch ABI
    const data = await response.json();
    userManager = new web3.eth.Contract(contractABI, contractAddress); // Initialize the contract

    const accounts = await web3.eth.getAccounts();
    if (accounts.length > 0) {
        const currentAddress = accounts[0];
        loadCurrentAddress(currentAddress); // Load current user address
        const ownerAddress = await loadOwner(); // Load the owner's address

        // Redirect if current address is not the owner
        if (currentAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
            alert("You are not the owner. Redirecting to main page.");
            window.location.href = "index.html";
        }
    } else {
        alert('No MetaMask account found.');
    }
} catch (error) {
    console.error('Error fetching ABI or initializing contract:', error);
    alert('Failed to load profile. Please try again.');
}
} else {
alert('MetaMask is not installed. Please install MetaMask and try again.');
}
});

async function loadOwner() {
try {
const ownerAddress = await userManager.methods.getOwner().call();
document.getElementById('ownerAddress').innerText = formatAddress(ownerAddress);
return ownerAddress; // Return the owner address
} catch (error) {
console.error('Error fetching owner address:', error);
alert('Failed to fetch owner address. See console for details.');
}
}


function formatAddress(address) {
    return address.slice(0, 6) + "..." + address.slice(-4);
}

async function loadCurrentAddress(account) {
    document.getElementById('currentAddress').innerText = formatAddress(account);
}

// Handle form submission
document.getElementById('addMovieForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const genre = document.getElementById('genre').value;

    const accounts = await web3.eth.getAccounts();
    try {
        await userManager.methods.addMovie(title, genre).send({ from: accounts[0] });
        alert("Movie added successfully!");
        document.getElementById('addMovieForm').reset();
    } catch (error) {
        console.error("Error adding movie:", error);
        alert("Failed to add movie. Please try again.");
    }
});