import transactionPaymentData from '../../smart_contract/build/contracts/TransactionPayment.json';
import userManagerData from '../../smart_contract/build/contracts/UserManagement.json';

const transactionPaymentAddress = transactionPaymentData.networks[5777]?.address; // TransactionPayment smart contract address
const userManagerAddress = userManagerData.networks[5777]?.address; // UserManager smart contract address
const transactionPaymentABI = transactionPaymentData.abi; // TransactionPayment smart contract ABI

let web3;
let transactionPayment;

window.addEventListener("load", async () => {
    try {
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            transactionPayment = new web3.eth.Contract(transactionPaymentABI, transactionPaymentAddress);

            const accounts = await web3.eth.getAccounts();
            if (accounts.length === 0) {
                alert("MetaMask not connected. Please connect to MetaMask.");
                return;
            }

            await loadUserSubscriptionDetails(accounts[0]);
        } else {
            alert("MetaMask is not installed. Please install MetaMask and try again.");
        }
    } catch (error) {
        console.error("Error loading subscription details: ", error);
    }
});
async function loadUserSubscriptionDetails(userAddress) {
    try {
        // Check if the user has an active subscription
        const subscriptionId = await transactionPayment.methods.userToSubscriptionId(userAddress).call();
        console.log("User Subscription ID: ", subscriptionId);
        
        // Verify subscription ID
        if (subscriptionId === '0') {
            alert("No active subscription for this user"); // Show the alert message
            window.location.href = "transaction.html"; // Redirect to user profile page
            return; // Exit the function
        }

        // Load subscription details from the TransactionPayment contract
        const subscription = await transactionPayment.methods.subscriptions(subscriptionId).call();
        console.log("Subscription Details: ", subscription);

        document.getElementById("subscriptionId").innerText = subscriptionId;
        document.getElementById("subscriptionStatus").innerText = getSubscriptionStatus(subscription);
        document.getElementById("subscriptionAmount").innerText = web3.utils.fromWei(subscription.amount.toString(), "ether");
        document.getElementById("unlockTime").innerText = new Date(subscription.unlockTime * 1000).toLocaleString();

    } catch (error) {
        console.error("Error fetching subscription details: ", error);
        alert("Failed to load subscription details: " + error.message);
    }
}



function getSubscriptionStatus(subscription) {
    if (subscription.cancelled) return "Cancelled";
    if (subscription.executed) return "Executed";
    return "Queued";
}

async function cancelSubscription(subscriptionId) {
    try {
        const accounts = await web3.eth.getAccounts();
        await transactionPayment.methods.cancelSubscription(subscriptionId).send({ from: accounts[0] });
        alert("Subscription cancelled successfully.");
        window.location.reload();
    } catch (error) {
        console.error("Error cancelling subscription: ", error);
        alert("Failed to cancel subscription: " + error.message);
    }
}
