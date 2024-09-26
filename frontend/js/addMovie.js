let web3;
let movieSubscriptionSystem;

import contractData from '../../smart_contract/build/contracts/ContentManagement.json';
const contractAddress = contractData.networks[5777]?.address; // Smart contract address
const contractABI = contractData.abi; // Smart contract's ABI

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

// Function to submit the movie form
async function submitMovieForm() {
    const name = document.getElementById('name').value;
    const rate = document.getElementById('rate').value;
    const releaseDate = Math.floor(new Date(document.getElementById('releaseDate').value).getTime() / 1000);
    const description = document.getElementById('description').value;

   
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0]; // Use the first account

    // Interact with the contract to store file names
    try {
        await movieSubscriptionSystem.methods.createMovie(name, rate, releaseDate, description, newImageFileName, newVideoFileName)
            .send({ from: account });

        alert('Movie created successfully! Please move the files to the appropriate directory.');
    } catch (error) {
        console.error(error);
        alert(`Error creating movie: ${error.message}`);
    }
}

// Event listener for form submission
document.getElementById('movieForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitMovieForm(); // Call the form submission function
});
