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

async function displayMovies() {
    try {
        if (!contentManagement.methods.getMovieCount) {
            console.error('Method getMovieCount does not exist on the contract. Check ABI or contract deployment.');
            return;
        }

        const movieCount = await contentManagement.methods.getMovieCount().call();
        const movieContainer = document.getElementById('movie-container');
        movieContainer.innerHTML = ''; // Clear previous movie entries if any

        const parentContainer = document.createElement('div');
        parentContainer.classList.add('parent-of-movie-items');

        for (let i = 1; i <= parseInt(movieCount); i++) {
            try {
                const movie = await contentManagement.methods.getMovie(i).call(); // Get movie details by ID

                // Check if the movie is available
                const isAvailable = await contentManagement.methods.isMovieAvailable(i).call();

                // Create a new movie element
                const movieElement = document.createElement('div');
                movieElement.classList.add('movie-item');

                // Set a default image for each movie
                const defaultImageUrl = '../images/movies/bat-man.jpg'; // Replace with the path to your default image

                // Create movie element based on availability
                if (isAvailable) {
                    // If the movie is available, make it clickable
                    movieElement.innerHTML = `
                    <a href="../pages/videoPlayer.html?movieId=${i}">
                        <img src="${defaultImageUrl}" alt="${movie[0]} Poster">
                        <div class="movie-item-content">
                            <div class="movie-item-title">${movie[0]}</div>
                            <div class="movie-infos">
                                <div class="movie-info">
                                    <i class="bx bxs-star"></i>
                                    <span>${movie[1]}</span> <!-- Assuming this is a rating or popularity score -->
                                </div>
                                <div class="movie-info">
                                    <i class="bx bxs-time"></i>
                                    <span>${new Date(movie[2] * 1000).toLocaleDateString()}</span> <!-- Movie release date -->
                                </div>
                                <div class="movie-info">
                                    <span>Released</span> <!-- Availability status -->
                                </div>
                            </div>
                        </div>
                    </a>
                    `;
                } else {
                    // If the movie is not available, add a click event that triggers an alert
                    movieElement.innerHTML = `
                    <div onclick="handleMovieClick(${i});" style="cursor: pointer;">
                        <img src="${defaultImageUrl}" alt="${movie[0]} Poster" style="opacity: 0.5;"> <!-- Dim the image -->
                        <div class="movie-item-content">
                            <div class="movie-item-title">${movie[0]}</div>
                            <div class="movie-infos">
                                <div class="movie-info">
                                    <i class="bx bxs-star"></i>
                                    <span>${movie[1]}</span> <!-- Assuming this is a rating or popularity score -->
                                </div>
                                <div class="movie-info">
                                    <i class="bx bxs-time"></i>
                                    <span>${new Date(movie[2] * 1000).toLocaleDateString()}</span> <!-- Movie release date -->
                                </div>
                                <div class="movie-info">
                                    <span>Not Released</span> <!-- Availability status -->
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                }

                parentContainer.appendChild(movieElement);
            } catch (error) {
                console.warn(`Movie with ID ${i} does not exist:`, error);
                continue; // Skip to the next iteration if the movie does not exist
            }
        }

        movieContainer.appendChild(parentContainer);

    } catch (error) {
        console.error("Error retrieving movie data:", error);
    }
}

// Function to handle movie click
function handleMovieClick(movieId) {
    // Show an alert if the movie hasn't been released yet
    alert("Movie hasn't been released yet.");
}

