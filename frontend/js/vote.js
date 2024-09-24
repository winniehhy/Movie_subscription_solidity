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
        const category = document.getElementById('category').value;
        const movie = document.getElementById('movieName').value;
        userAddress = localStorage.getItem('userAddress');
        
        try {
            await movieVotingContract.methods.submitVote(category, movie).send({ from: userAddress });
            alert('Vote submitted successfully!'+'\nUserAdress: ' + userAddress + '\nCategory: '+ category + '\nMovie: ' + movie);
        } catch (error) {
            console.error("Error submitting vote:", error);
            alert('Failed to submit vote. Probably Vote did not start,Vote is over or You already vote' +'\nUserAdress: ' + userAddress + '\nCategory: '+ category + '\nMovie: ' + movie);
        }
    }
    //Handle cancel vote
    async function CancelVoteFunc() {
    const cancelcategory = document.getElementById('cancelcategory').value;
    userAddress = localStorage.getItem('userAddress');
    try {
        await movieVotingContract.methods.cancelVote(cancelcategory).send({ from: userAddress });
        alert('Vote cancelled successfully!');
    } catch (error) {
        console.error("Error cancelling vote:", error);
        alert('Failed to cancel vote. Because you did not voted for this category');
    }
    }
    //Handle display vote
    async function displayVotingResults() {
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
        alert('Failed to retrieve voting results, Probably Vote did not start or over');
    }
}

