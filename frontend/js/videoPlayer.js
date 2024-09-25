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
    } else {
        alert('Please install MetaMask to interact with the movie system.');
    }
});

const movieId = 1; // Set this to the ID of the movie you want to display
const movie = await contract.methods.getMovie(movieId).call();

// Populate movie details on the page
document.getElementById('movie-name').innerText = movie.name;
document.getElementById('movie-rate').innerText = movie.rate;
document.getElementById('release-date').innerText = new Date(movie.releaseDate * 1000).toLocaleDateString();
document.getElementById('end-date').innerText = new Date(movie.endDate * 1000).toLocaleDateString();
document.getElementById('movie-description').innerText = movie.description;
document.getElementById('is-released').innerText = movie.isReleased ? 'Yes' : 'No';

// You can update the video player source dynamically if needed
if (movie.isReleased) {
    // Assuming you have a specific video file for each movie
    document.getElementById('movie-video').src = `path_to_your_movie_videos/movie_${movieId}.mp4`;
}
