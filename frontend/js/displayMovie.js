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

                // Create a new movie element
                const movieElement = document.createElement('div');
                movieElement.classList.add('movie-item');

                // Set a default image for each movie
                const defaultImageUrl = '../images/movies/bat-man.jpg'; // Replace with the path to your default image

                // Convert release date to GMT+8 for display
                const releaseDateGMT8 = convertToGMT8(new Date(movie[2] * 1000));

                // Dynamically check the availability of the movie
                const isAvailable = await contentManagement.methods.isMovieAvailable(i).call();

                // Add movie details based on availability
                if (isAvailable) {
                    // Movie is available, wrap it with an <a> tag for navigation
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
                                        <span>${releaseDateGMT8}</span> <!-- Movie release date in GMT+8 -->
                                    </div>
                                    <div class="movie-info">
                                        <span>Released</span> <!-- Availability status -->
                                    </div>
                                </div>
                            </div>
                        </a>
                    `;
                } else {
                    // Movie is not available, show an alert on click
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
                                        <span>${releaseDateGMT8}</span> <!-- Movie release date in GMT+8 -->
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

// Convert to GMT+8 function
function convertToGMT8(date) {
    // Convert the date to the time zone offset for GMT+8 (UTC+8)
    const gmt8Offset = 8 * 60; // Offset in minutes
    const localTime = new Date(date.getTime() + gmt8Offset * 60 * 1000);
    
    // Format the date as a string (e.g., 'MM/DD/YYYY HH:MM:SS')
    return localTime.toLocaleDateString() + ' ' + localTime.toLocaleTimeString();
}

// Function to handle movie click for unreleased movies
async function handleMovieClick(movieId) {
    alert("Movie hasn't been released yet.");
    console.log(`Attempted to access movie ID: ${movieId}`); // Debug log
}





