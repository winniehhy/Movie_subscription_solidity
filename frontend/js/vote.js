import contractData from '/../smart_contract/build/contracts/MovieVoting.json';
        const contractAddress = contractData.networks[5777]?.address;  // smart contract address
        const contractABI = contractData.abi; // smart contract's ABI
        let movieVotingContract;
        let web3;
        let userAddress;
        document.getElementById('submitVoteButton').addEventListener('click', submitVoteFunc);
        document.getElementById('cancelVoteButton').addEventListener('click', CancelVoteFunc);
        document.getElementById('DisplayVoteButton').addEventListener('click', displayVotingResults);
        // Initialize contract
        web3 = new Web3(window.ethereum);
        movieVotingContract = new web3.eth.Contract(contractABI, contractAddress);

        const loginText = document.querySelector(".title-text .login");
        const loginForm = document.querySelector("form.login");
        const loginBtn = document.querySelector("label.login");
        const signupBtn = document.querySelector("label.signup");
        signupBtn.onclick = (()=>{
          loginForm.style.marginLeft = "-50%";
          loginText.style.marginLeft = "-50%";
        });
        loginBtn.onclick = (()=>{
          loginForm.style.marginLeft = "0%";
          loginText.style.marginLeft = "0%";
        });
        
    async function initialize() {
    if (typeof window.ethereum !== 'undefined') {
        userAddress = localStorage.getItem('userAddress');
        console.log('User Address from Local Storage:' + userAddress);

        if (userAddress) {
            document.getElementById('userAddress').textContent = userAddress;
            document.getElementById('walletDropdown').style.display = 'block';
        } else {
            console.log('No user address found. Please connect the wallet.');
            document.getElementById('connectButton').addEventListener('click', connectWallet);
        }
    } else {
        alert('Please install MetaMask!');
    }
    }
    // Handle Submit Vote
    async function submitVoteFunc() {
        event.preventDefault();
        const category = document.getElementById('category').value;
        const movie = document.getElementById('movieName').value;
        userAddress = localStorage.getItem('userAddress');
        
        try {
            await movieVotingContract.methods.submitVote(category, movie).send({ from: userAddress });
            alert('Vote submitted successfully!'+'\nUserAdress: ' + userAddress + '\nCategory: '+ category + '\nMovie: ' + movie);
        } catch (error) {
            console.error("Error submitting vote:", error);
            alert('Failed to submit vote. \nProbably Vote did not start,Vote is over or You already vote' +'\nUserAdress: ' + userAddress + '\nCategory: '+ category + '\nMovie: ' + movie);
        }
    }
    //Handle cancel vote
    async function CancelVoteFunc() {
    event.preventDefault();
    const cancelcategory = document.getElementById('cancelcategory').value;
    userAddress = localStorage.getItem('userAddress');
    try {
        await movieVotingContract.methods.cancelVote(cancelcategory).send({ from: userAddress });
        alert('Vote cancelled successfully!');
    } catch (error) {
        console.error("Error cancelling vote:", error);
        alert('Failed to cancel vote. \nBecause you did not voted for this category');
    }
    }
    //Handle display vote
    async function displayVotingResults() {
    event.preventDefault();
    const category = document.getElementById('viewCategoryResult').value; // Get selected category
    try {
        // Call the viewVotingResults function
        const results = await movieVotingContract.methods.viewVotingResults(category).call();
        
        const movieNames = results[0]; // Array of movie names
        const voteCounts = results[1]; // Array of vote counts

        // Display results in a table format
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = ""; // Clear previous results
        //Create title
        const title = document.createElement('h4');
        title.innerText = `${category}`;
        resultsDiv.appendChild(title);
        // Create table
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Movie Name</th>
                    <th>Votes</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;
        
        const tbody = table.querySelector('tbody');

        for (let i = 0; i < movieNames.length; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${movieNames[i]}</td>
                <td>${voteCounts[i]}</td>
            `;
            tbody.appendChild(row);
        }

        resultsDiv.appendChild(table); // Append the table to the results div
    } catch (error) {
        console.error("Error retrieving voting results:", error);
        alert('Failed to retrieve voting results. \nProbably Vote did not start or Vote is over');
    }
}
//Movie slideshow
$(document).ready(() => {
    $('#hamburger-menu').click(() => {
        $('#hamburger-menu').toggleClass('active')
        $('#nav-menu').toggleClass('active')
    })

    // setting owl carousel

    let navText = ["<i class='bx bx-chevron-left'></i>", "<i class='bx bx-chevron-right'></i>"]

    $('#top-movies-slide').owlCarousel({
        items: 1,
        dots: false,
        loop: true,
        autoplay: true,
        autoplayHoverPause: true,
        responsive: {
            400: {
                items: 1
            },
            1280: {
                items: 1
            },
            1600: {
                items: 1
            }
        }
    })

    // MetaMask connection
   $('#connectButton').click(async (event) => {
    event.preventDefault();
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Connected account:', accounts[0]);
            $('#connectButton span:first-child').text(''); // Remove "Connect Wallet" text
            $('#userAddress').text(accounts[0]); // Update the user address display
            localStorage.setItem('userAddress', accounts[0]); // Store the user address in local storage
        } catch (error) {
            console.error('Error connecting to MetaMask:', error.message);
        }
    } else {
        console.error('MetaMask is not installed!');
        alert('Please install MetaMask!');
    }
});

// Show dropdown when clicking on user address
$('#userAddress').click((event) => {
    event.preventDefault();
    $('#walletDropdown').toggle(); // Toggle the dropdown menu
});

// Disconnect Wallet
$('#disconnectButton').click((event) => {
    event.preventDefault();
    $('#connectButton span:first-child').text('Connect Wallet'); // Restore "Connect Wallet" text
    $('#userAddress').text(''); // Clear the user address display
    $('#walletDropdown').hide(); // Hide the dropdown menu
    localStorage.removeItem('userAddress'); // Remove the user address from local storage
    console.log('Wallet disconnected');
});

    // Copy Address
    $('#copyAddressButton').click(() => {
        const userAddress = localStorage.getItem('userAddress');
        navigator.clipboard.writeText(userAddress).then(() => {
            alert('Address copied to clipboard.');
        }).catch(err => {
            console.error('Failed to copy address:', err);
        });
    });

// Hide dropdown when clicking outside
$(document).click((event) => {
    if (!$(event.target).closest('#connectButton').length && !$(event.target).closest('#userAddress').length) {
        $('#walletDropdown').hide();
    }
});

// Check if user is already connected
const storedUserAddress = localStorage.getItem('userAddress');
    if (storedUserAddress) {
        $('#userAddress').text(storedUserAddress);
        $('#connectButton span:first-child').text(''); // Remove "Connect Wallet" text
        $('#connectButton').css({
            'width': '200px',
            'overflow': 'hidden',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap'
        });
    }
})


