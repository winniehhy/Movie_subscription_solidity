let web3;
let movieSubscriptionSystem;

import contractData from '../../smart_contract/build/contracts/ContentManagement.json';
const contractAddress = contractData.networks[5777]?.address;  // smart contract address
const contractABI = contractData.abi; // smart contract's ABI

// MetaMask connection
window.addEventListener('load', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await ethereum.request({ method: 'eth_requestAccounts' });
        movieSubscriptionSystem = new web3.eth.Contract(contractABI, contractAddress);

        // Retrieve movieId from URL
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('movieId'); // Get movieId from query parameter

        // Check if movieId is valid
        if (movieId) {
            try {
                const movie = await movieSubscriptionSystem.methods.getMovie(movieId).call();
                populateMovieDetails(movie);
            } catch (error) {
                console.error("Error fetching movie:", error);
            }
        } else {
            console.error("Movie ID not found in URL.");
        }
    } else {
        alert('Please install MetaMask to interact with the movie system.');
    }
});

// Function to populate movie details on the page
function populateMovieDetails(movie) {
    console.log("Fetched Movie Details:", movie);
    
    document.getElementById('movie-name').innerText = movie.name;
    document.getElementById('movie-rate').innerText = movie.rate;
    document.getElementById('release-date').innerText = new Date(movie.releaseDate * 1000).toLocaleDateString();
    document.getElementById('movie-description').innerText = movie.description;
    document.getElementById('is-released').innerText = movie.isAvailable ? 'Yes' : 'No';


}
