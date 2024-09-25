let web3;
let contentManagement;

import contractData from '../../smart_contract/build/contracts/ContentManagement.json';
const contractAddress = contractData.networks[5777]?.address;  // Smart contract address
const contractABI = contractData.abi; // Smart contract's ABI

// MetaMask connection
window.addEventListener('load', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await ethereum.request({ method: 'eth_requestAccounts' });
        contentManagement = new web3.eth.Contract(contractABI, contractAddress);
        displayMovies();
    } else {
        alert('Please install MetaMask to interact with the movie system.');
    }
});

// Function to get and display all movie details
async function displayMovies() {
    try {
        // Check if the method exists and log available methods
        if (!contentManagement.methods.getMovieCount) {
            console.error('Method getMovieCount does not exist on the contract. Check ABI or contract deployment.');
            return;
        }

        // Fetch the total number of movies
        const movieCount = await contentManagement.methods.getMovieCount().call();
        const movieContainer = document.getElementById('movie-container');
        movieContainer.innerHTML = ''; // Clear previous movie entries if any

        // Loop through each movie starting from index 1 to movieCount
        for (let i = 0; i <= parseInt(movieCount); i++) {
            try {
                const movie = await contentManagement.methods.getMovie(i).call(); // Get movie details by ID

                // Create a new movie element
                const movieElement = document.createElement('div');
                movieElement.classList.add('movie');

                // Set a default image for each movie
                const defaultImageUrl = '../images/movies/bat-man.jpg'; // Replace with the path to your default image

                // Add movie details including the default image
                movieElement.innerHTML = `
                    <a href="../pages/videoPlayer.html"><img src="${defaultImageUrl}" alt="Movie Image">
    <div class="movie-item-content"></a>
        <div class="movie-item-title">
            ${movie[0]}
        </div>
        <div class="movie-infos">
            <div class="movie-info">
                <i class="bx bxs-star"></i>
                <span>${movie[1]}</span>
            </div>
            <div class="movie-info">
                <i class="bx bxs-time"></i>
                <span>${new Date(movie[2] * 1000).toLocaleDateString()} - ${new Date(movie[3] * 1000).toLocaleDateString()}</span>
            </div>
            <div class="movie-info">
                <span>${movie[5] ? 'Released' : 'Not Released'}</span>
            </div>
        </div>
    </div>
            `;

                // Append the created movie element to the container
                movieContainer.appendChild(movieElement);
            } catch (error) {
                console.warn(`Movie with ID ${i} does not exist:`, error);
                continue; // Skip to the next iteration if the movie does not exist
            }
        }
    } catch (error) {
        console.error("Error retrieving movie data:", error);
    }
}


// Initialize web3 when the window loads
window.addEventListener('load', initWeb3);
