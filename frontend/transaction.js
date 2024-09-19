import contractData from '../smart_contract/build/contracts/TransactionPayment.json'; // Import the contract data

const contractAddress = '0x8E4d7e9fAC0DD369Dfc5f21A51565591593f9B18';
const contractABI = contractData.abi;

let web3;
let userAddress;
let transactionPayment;
let countdownInterval;

async function initialize() {
    if (typeof window.ethereum !== 'undefined') {
        userAddress = localStorage.getItem('userAddress');
        const userAddressElement = document.getElementById('userAddress');
        const connectButton = document.getElementById('connectButton');

        if (userAddress) {
            web3 = new Web3(window.ethereum);
            userAddressElement.textContent = userAddress;
            console.log('Using connected MetaMask account:', userAddress);

            // Initialize contract
            transactionPayment = new web3.eth.Contract(contractABI, contractAddress);
        } else {
            userAddressElement.textContent = 'Please connect your wallet on the main page.';
            connectButton.style.display = 'none'; // Hide the connect button if the user is not connected
        }
    } else {
        alert('Please install MetaMask!');
    }
}

async function queueTransaction(contract, recipient, amount, planType, customDays) {
    let durationInSeconds;
    if (planType === 'Monthly') {
        durationInSeconds = 30 * 24 * 60 * 60; // 30 days in seconds
    } else if (planType === 'Yearly') {
        durationInSeconds = 365 * 24 * 60 * 60; // 365 days in seconds
    } else if (planType === 'Custom') {
        durationInSeconds = customDays * 24 * 60 * 60; // Custom days in seconds
    } else {
        console.error('Invalid plan type.');
        return;
    }

    const executionTime = Math.floor(Date.now() / 1000) + durationInSeconds; // Set execution time based on the plan duration
    let isQueued = false;
    try {
        console.log('Queueing transaction with recipient:', recipient, 'amount:', amount);
        const tx = await contract.methods.queueTransaction(recipient, web3.utils.toWei(amount.toString(), 'ether'), executionTime).send({
            from: userAddress,
            value: web3.utils.toWei(amount.toString(), 'ether')
        });
        console.log('Transaction queued:', tx);

        // Generate a random 5-digit transaction ID
        const transactionId = Math.floor(10000 + Math.random() * 90000);
        alert(`Transaction queued successfully! Your transaction ID is: ${transactionId}`);

        // Store the transaction ID in local storage
        localStorage.setItem('transactionId', transactionId);

        // Start countdown timer
        startCountdown(planType, customDays, tx.transactionHash);

        isQueued = true;
    } catch (error) {
        console.error('Error queuing transaction:', error);
        alert('Failed to queue transaction. Error: ' + error.message);
    }
    return isQueued;
}

function startCountdown(planType, customDays, transactionId) {
    const countdownElement = document.getElementById('transactionCountdown');
    const timeLeftElement = document.getElementById('timeLeft');
    const doneButton = document.getElementById('doneButton');

    if (!countdownElement || !timeLeftElement || !doneButton) {
        console.error('Countdown elements not found in the DOM.');
        return;
    }

    countdownElement.style.display = 'block'; // Show the countdown element

    let executionTime;
    const now = Math.floor(Date.now() / 1000);

    if (planType === 'Monthly') {
        executionTime = now + (30 * 24 * 60 * 60); // 30 days in seconds
    } else if (planType === 'Yearly') {
        executionTime = now + (365 * 24 * 60 * 60); // 365 days in seconds
    } else if (planType === 'Custom') {
        executionTime = now + (customDays * 24 * 60 * 60); // Custom days in seconds
    } else {
        console.error('Invalid plan type.');
        return;
    }

    countdownInterval = setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = executionTime - currentTime;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            timeLeftElement.textContent = 'Transaction executed!';
            return;
        }

        const days = Math.floor(timeLeft / (24 * 60 * 60));
        const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
        const seconds = timeLeft % 60;

        timeLeftElement.textContent = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
    }, 1000);

    doneButton.onclick = async () => {
        clearInterval(countdownInterval);
        timeLeftElement.textContent = 'Transaction executed!';
        countdownElement.style.display = 'none'; // Hide the countdown element
        await executeTransaction(transactionId);
        alert('Executed transaction: Your plan had expired');
    };
}

async function executeTransaction(transactionId) {
    try {
        const tx = await transactionPayment.methods.executeTransaction(transactionId).send({ from: userAddress });
        console.log('Transaction executed:', tx);
    } catch (error) {
        console.error('Error executing transaction:', error);
        alert('Failed to execute transaction. Error: ' + error.message);
    }
}

async function cancelTransaction(transactionId) {
    try {
        const storedTransactionId = localStorage.getItem('transactionId');

        if (transactionId !== storedTransactionId) {
            alert('Invalid transaction ID.');
            return;
        }

        const tx = await transactionPayment.methods.cancelTransaction(transactionId).send({ from: userAddress });
        console.log('Transaction canceled:', tx);
        alert('Transaction canceled successfully! The amount has been refunded to your wallet.');
        localStorage.removeItem('transactionId'); // Remove the transaction ID from local storage
    } catch (error) {
        console.error('Error canceling transaction:', error);
        alert('Failed to cancel transaction. Error: ' + error.message);
    }
}

$(document).ready(async () => {
    await initialize();

    // Function to calculate custom amount
    function calculateCustomAmount(days) {
        return days * 0.15;
    }

    // Calculate Custom Plan Amount
    $('#customPlanButton').click(() => {
        const days = $('#customDays').val();
        console.log('Days entered:', days); // Debug log
        if (days > 0) {
            const amount = calculateCustomAmount(days);
            console.log('Calculated amount:', amount); // Debug log
            $('#selectedPlan').val(`Custom: ${days} days`);
            $('#selectedAmount').val(amount);
            $('#customPlanAmount').text(`Custom Plan Amount: ${amount} ETH`);
            $('#customPlanAmount').addClass('white-text'); // Ensure the text is white
        } else {
            alert('Please enter a valid number of days.');
        }
    });

    // Handle Plan Selection
    $('.plan-button').click(function() {
        const plan = $(this).data('plan');
        const amount = $(this).data('amount');
        if (plan === 'Custom') {
            const days = $('#customDays').val();
            if (days > 0) {
                const customAmount = calculateCustomAmount(days);
                $('#selectedPlan').val(`Custom: ${days} days`);
                $('#selectedAmount').val(customAmount);
                $('#customPlanAmount').text(`Custom Plan Amount: ${customAmount} ETH`);
                $('#customPlanAmount').addClass('white-text'); // Ensure the text is white
                alert(`Selected Plan: Custom (${days} days), Amount: ${customAmount} ETH`);
            } else {
                alert('Please enter a valid number of days.');
                return;
            }
        } else {
            $('#selectedPlan').val(plan);
            $('#selectedAmount').val(amount);
            alert(`Selected Plan: ${plan}, Amount: ${amount} ETH`);
        }
        $('#subscribeForm').submit();
    });

    // Handle form submission
    $('#subscribeForm').submit(async (event) => {
        event.preventDefault();
        const plan = $('#selectedPlan').val();
        const amount = $('#selectedAmount').val();
        let planType;
        let customDays = 0;

        if (plan.includes('Custom')) {
            planType = 'Custom';
            customDays = parseInt($('#customDays').val());
        } else if (plan === 'Monthly') {
            planType = 'Monthly';
        } else if (plan === 'Yearly') {
            planType = 'Yearly';
        } else {
            console.error('Invalid plan type.');
            return; // Exit early if the plan type is invalid
        }

        console.log(`Form submitted with planType: ${planType}, amount: ${amount}, customDays: ${customDays}`);

        const isQueued = await queueTransaction(transactionPayment, userAddress, amount, planType, customDays);
        if (isQueued) {
            console.log('Transaction successfully added to the queue.');
        } else {
            console.log('Failed to add transaction to the queue.');
        }
    });

// Handle cancel subscription
$('#cancelSubscriptionButton').click(async () => {
    const transactionId = prompt('Please enter your transaction ID:');
    if (transactionId) {
        await cancelTransaction(transactionId);
    } else {
        alert('Please enter a valid transaction ID.');
    }
});

    // Copy Address
    $('#copyAddressButton').click(() => {
        navigator.clipboard.writeText(userAddress).then(() => {
            alert('Address copied to clipboard.');
        }).catch(err => {
            console.error('Failed to copy address:', err);
        });
    });
});