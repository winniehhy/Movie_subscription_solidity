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
    userManager = new web3.eth.Contract(contractABI, contractAddress);

    // Load the initial account and profile
    const accounts = await web3.eth.getAccounts();
    if (accounts.length > 0) {
        await loadProfile(accounts[0]); // Load user profile
        await loadOwner(); // Load the owner's address
    } else {
        alert('No MetaMask account found.');
    }

    // Listen for account changes
    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
            await loadProfile(accounts[0]); // Load new account profile
            await loadOwner(); // Reload owner's address for the new account
        } else {
            alert('No MetaMask account found.'); // Handle case when no accounts are available
            window.location.href = "register.html"; // Optionally redirect if no account
        }
    });

} catch (error) {
    console.error('Error fetching ABI or initializing contract:', error);
    alert('Failed to load profile. Please try again.');
}
} else {
alert('MetaMask is not installed. Please install MetaMask and try again.');
}
});


// Helper function to format the Ethereum address
function formatAddress(address) {
    return address.slice(0, 6) + "..." + address.slice(-4);
}

async function loadProfile(account) {
    try {
        const isRegistered = await userManager.methods.isUserRegistered(account).call();
        console.log(`Is user registered: ${isRegistered}`); // Debugging line
        if (isRegistered) {
            const profile = await userManager.methods.getProfile().call({ from: account });
            console.log('Profile:', profile); // Debugging line
            const lastUpdatedTime = profile[3]; // lastUpdated
            const updateInterval = 24 * 60 * 60; // 24 hours in seconds
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

            document.getElementById('username').innerText = profile[0];
            document.getElementById('email').innerText = profile[1];
            document.getElementById('address').innerText = formatAddress(profile[2]);

            // Check if lastUpdatedTime is greater than 0
            if (lastUpdatedTime > 0) {
                const nextUpdateTime = parseInt(lastUpdatedTime) + updateInterval;
                document.getElementById('lastUpdated').innerText = new Date(lastUpdatedTime * 1000).toLocaleString(); // Convert to milliseconds

                if (currentTime >= nextUpdateTime) {
                    // User can update again
                    document.getElementById('nextUpdateTime').innerText = "You can update your profile now.";
                } else {
                    // Calculate and display the next update time
                    const nextUpdateDate = new Date(nextUpdateTime * 1000).toLocaleString();
                    document.getElementById('nextUpdateTime').innerText = `Next update available at: ${nextUpdateDate}`;
                }
            } else {
                document.getElementById('lastUpdated').innerText = "Not yet updated"; // Show message if not updated
                document.getElementById('nextUpdateTime').innerText = "You can update your profile anytime.";
            }
        } else {
            throw new Error("User not registered");
        }
    } catch (error) {
        console.error("Error loading profile:", error);
        alert("You are not registered. Please register before accessing this page.");
        window.location.href = "register.html"; // Redirect to the registration page
    }
}

// Restrict Add Movie button to contract owner
async function loadOwner() {
    try {
        const ownerAddress = await userManager.methods.getOwner().call();
        document.getElementById('ownerAddress').innerText = formatAddress(ownerAddress);

        const accounts = await web3.eth.getAccounts();
        if (accounts[0].toLowerCase() === ownerAddress.toLowerCase()) {
            document.getElementById('addMovieBtn').style.display = 'block'; // Show the Add Movie button for the owner
        } else {
            document.getElementById('addMovieBtn').style.display = 'none'; // Hide the Add Movie button for non-owners
        }
    } catch (error) {
        console.error('Error fetching owner address:', error);
        alert('Failed to fetch owner address. See console for details.');
    }
}

document.getElementById('disconnectMetaMask').addEventListener('click', () => {
    alert('Disconnected from MetaMask.');
});