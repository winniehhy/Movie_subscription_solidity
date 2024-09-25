import Web3 from 'web3';
import { create } from 'ipfs-http-client';

let web3;
let movieSubscriptionSystem;

import contractData from '../../smart_contract/build/contracts/ContentManagement.json';
const contractAddress = contractData.networks[5777]?.address;  // smart contract address
const contractABI = contractData.abi; // smart contract's ABI

// Initialize IPFS client
const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

// MetaMask connection
window.addEventListener('load', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await ethereum.request({ method: 'eth_requestAccounts' });
        movieSubscriptionSystem = new web3.eth.Contract(contractABI, contractAddress);
    } else {
        alert('Please install MetaMask to interact with the movie system.');
    }
});

// Form submission
// Function to handle form submission
async function submitMovieForm() {
    const name = document.getElementById('name').value;
    const rate = document.getElementById('rate').value;
    const releaseDate = Math.floor(new Date(document.getElementById('releaseDate').value).getTime() / 1000);
    const endDate = Math.floor(new Date(document.getElementById('endDate').value).getTime() / 1000);
    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('image').files[0];

    try {
        // Upload image to IPFS
        const added = await ipfs.add(imageFile);
        const imageUrl = `https://ipfs.infura.io/ipfs/${added.path}`; // Get IPFS URL

        // Get accounts from MetaMask
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];  // Use the first account

        // Interact with the contract
        await movieSubscriptionSystem.methods.createMovie(name, rate, releaseDate, endDate, description, imageUrl)
            .send({ from: account });

        alert('Movie created successfully!');
    } catch (error) {
        console.error('Error creating movie:', error);
        alert('Error creating movie.');
    }
}

// Event listener for form submission
document.getElementById('movieForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitMovieForm();  // Call the form submission function
});