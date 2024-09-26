import contractData from '/../smart_contract/build/contracts/TransactionPayment.json';

        const contractAddress = contractData.networks[5777]?.address;  // smart contract address
        const contractABI = contractData.abi; // smart contract's ABI

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

            try {
                // Initialize contract
                transactionPayment = new web3.eth.Contract(contractABI, contractAddress);

                // Listen for events
                transactionPayment.events.SubscriptionQueued({ filter: { subscriber: userAddress } })
                    .on('data', event => {
                        console.log('Subscription queued:', event);
                        updateStatus('queued');
                    })
                    .on('error', console.error);

                transactionPayment.events.SubscriptionExecuted({ filter: { subscriber: userAddress } })
                    .on('data', event => {
                        console.log('Subscription executed:', event);
                        updateStatus('executed');
                    })
                    .on('error', console.error);

                transactionPayment.events.SubscriptionCancelled({ filter: { subscriber: userAddress } })
                    .on('data', event => {
                        console.log('Subscription cancelled:', event);
                        updateStatus('cancelled');
                    })
                    .on('error', console.error);
            } catch (error) {
                console.error('Error initializing contract:', error);
                alert('Failed to initialize contract. Please try again.');
            }
        } else {
            userAddressElement.textContent = 'Please connect your wallet on the main page.';
            connectButton.style.display = 'none'; // Hide the connect button if the user is not connected
        }
    } else {
        alert('Please install MetaMask!');
    }
}

          //=============================Notification================================
// Function to set up smart contract event listeners
function setupEventListeners() {
    transactionPayment.events.SubscriptionQueued({ filter: { subscriber: userAddress } })
        .on('data', event => {
            console.log('Subscription queued:', event);
            updateStatus('queued');

          //=============================Notification================================
            const notifications = JSON.parse(localStorage.getItem(userNotificationsKey())) || [];
            const planType = localStorage.getItem('planType');
            const customDays = parseInt(localStorage.getItem('customDays'), 10);

            // Calculate start and end dates
            const startDate = new Date();
            let durationInMilliseconds;
            if (planType === 'Monthly') {
                durationInMilliseconds = 30 * 24 * 60 * 60 * 1000;
            } else if (planType === 'Yearly') {
                durationInMilliseconds = 365 * 24 * 60 * 60 * 1000;
            } else if (planType === 'Custom') {
                durationInMilliseconds = customDays * 24 * 60 * 60 * 1000;
            }

            const endDate = new Date(startDate.getTime() + durationInMilliseconds);

            

            const newNotification = {
                message: `Subscription queued successfully! Your subscription ID is: ${event.returnValues.subscriptionId}`,
                subscriptionId: event.returnValues.subscriptionId,
                planType: planType,
                startDate: startDate.toLocaleDateString(),
                endDate: endDate.toLocaleDateString(),
                timestamp: Date.now()
            };

            notifications.push(newNotification);
            localStorage.setItem(userNotificationsKey(), JSON.stringify(notifications));

            if (typeof loadNotifications === 'function') {
                loadNotifications();
            }
        })

         //=============================Notification================================
        .on('error', console.error);

    transactionPayment.events.SubscriptionExecuted({ filter: { subscriber: userAddress } })
        .on('data', event => {
            console.log('Subscription executed:', event);
            updateStatus('executed');
        })
        .on('error', console.error);

    transactionPayment.events.SubscriptionCancelled({ filter: { subscriber: userAddress } })
        .on('data', event => {
            console.log('Subscription cancelled:', event);
            updateStatus('cancelled');
 //=============================Notification Start ================================
               // Add the new notification to localStorage
               const notifications = JSON.parse(localStorage.getItem(userNotificationsKey())) || [];
               const newNotification = {
                   message: `Subscription Cancelled successfully! Your subscription ID is: ${event.returnValues.subscriptionId}`,
                   timestamp: Date.now()
               };
               notifications.push(newNotification);
               localStorage.setItem(userNotificationsKey(), JSON.stringify(notifications));

               // Update the notification panel if it exists
               if (typeof loadNotifications === 'function') {
                   loadNotifications();
               }
           })
             //=============================Notification End================================
        .on('error', console.error);
}

async function queueSubscription(amount, planType, customDays) {
    let durationInSeconds;

    // Calculate the duration based on the plan type
    if (planType === 'Monthly') {
        durationInSeconds = 30 * 24 * 60 * 60; // 30 days in seconds
    } else if (planType === 'Yearly') {
        durationInSeconds = 365 * 24 * 60 * 60; // 365 days in seconds
    } else if (planType === 'Custom') {
        durationInSeconds = customDays * 24 * 60 * 60; // Custom days in seconds
    } else {
        alert('Invalid plan type selected.');
        return false;
    }

    const unlockTime = Math.floor(Date.now() / 1000) + durationInSeconds; // Set unlock time
    let isQueued = false;

    try {
        console.log('Queueing subscription with amount:', amount);
        const tx = await transactionPayment.methods.queueSubscription(unlockTime).send({
            from: userAddress,
            value: web3.utils.toWei(amount.toString(), 'ether')
        });

        // Log the entire transaction receipt
        console.log('Transaction receipt:', JSON.stringify(tx, null, 2));

        // Checking for a successful transaction
        if (tx.status) {
            console.log('Transaction successful');
        } else {
            console.error('Transaction failed');
            alert('Transaction failed.');
            return false;
        }

        // Check for events in the transaction receipt
        if (tx.events && tx.events.SubscriptionQueued) {
            // Get the subscription ID from the event logs
            let subscriptionId = tx.events.SubscriptionQueued.returnValues.subscriptionId;
            console.log('Subscription ID:', subscriptionId); // Log the subscription ID
            alert(`Subscription queued successfully! Your subscription ID is: ${subscriptionId}`);

            // Store the subscription ID in local storage
            localStorage.setItem('subscriptionId', subscriptionId);

            // Calculate and display the start and end dates
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + durationInSeconds * 1000);

            const startDateString = startDate.toLocaleDateString();
            const endDateString = endDate.toLocaleDateString();

            // Prompt the start and end dates
            alert(`Subscription Start Date: ${startDateString}\nSubscription End Date: ${endDateString}`);

            // Start countdown timer
            startCountdown(planType, customDays, subscriptionId);

            isQueued = true;
        } else {
            // Fallback: Log the transaction logs to inspect manually if no events are found
            console.error('No SubscriptionQueued event found in transaction receipt.');
            console.log('Transaction logs:', tx.logs);  // Log tx.logs for further inspection
            alert('Failed to queue subscription. Event not found.');
        }
    } catch (error) {
        console.error('Error queuing subscription:', error);
        alert('Failed to queue subscription. Error: ' + error.message);
    }

    return isQueued;
}

function startCountdown(planType, customDays, subscriptionId) {
    const countdownElement = document.getElementById('transactionCountdown');
    const timeLeftElement = document.getElementById('timeLeft');
    const doneButton = document.getElementById('doneButton');

    if (!countdownElement || !timeLeftElement || !doneButton) {
        console.error('Countdown elements not found in the DOM.');
        return;
    }

    countdownElement.style.display = 'block'; // Show the countdown element

    let unlockTime;
    const now = Math.floor(Date.now() / 1000);

    if (planType === 'Monthly') {
        unlockTime = now + (30 * 24 * 60 * 60); // 30 days in seconds
    } else if (planType === 'Yearly') {
        unlockTime = now + (365 * 24 * 60 * 60); // 365 days in seconds
    } else if (planType === 'Custom') {
        unlockTime = now + (customDays * 24 * 60 * 60); // Custom days in seconds
    } else {
        console.error('Invalid plan type.');
        return;
    }

    console.log(`Starting countdown for subscription ID: ${subscriptionId}, unlock time: ${unlockTime}`);

    countdownInterval = setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = unlockTime - currentTime;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            timeLeftElement.textContent = 'Subscription executed!';
            return;
        }

        const days = Math.floor(timeLeft / (24 * 60 * 60));
        const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
        const seconds = timeLeft % 60;

        timeLeftElement.textContent = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
    }, 1000);

    doneButton.onclick = async () => {
        const userConfirmed = confirm('Your plan will be executed and terminated immediately. Are you sure you want to proceed?');
        if (userConfirmed) {
            const subscriptionId = prompt('Please enter your subscription ID:');
            if (!subscriptionId) {
                alert('Subscription ID is required to execute the plan.');
                return;
            }

            try {
                clearInterval(countdownInterval);
                timeLeftElement.textContent = 'Subscription cancelled!';
                countdownElement.style.display = 'none'; // Hide the countdown element
                await executeSubscription(subscriptionId);
            } catch (error) {
                console.error('Error executing subscription:', error);
                alert('Failed to execute subscription. Error: ' + error.message);
            }
        }
    };
}


function stopTimer() {
    // Assuming you have a global variable `countdownInterval` for the countdown timer
    clearInterval(countdownInterval);
    console.log('Timer stopped.');

    const timeLeftElement = document.getElementById('timeLeft');
    const countdownElement = document.getElementById('transactionCountdown');
    if (timeLeftElement && countdownElement) {
        timeLeftElement.textContent = 'Subscription cancelled!';
        countdownElement.style.display = 'none'; // Hide the countdown element
    }
}

function updateStatus(status) {
    const statusElement = document.getElementById('subscriptionStatus');
    if (!statusElement) {
        console.error('Status element not found in the DOM.');
        return;
    }

    switch (status) {
        case 'queued':
            statusElement.textContent = 'Subscription queued successfully!';
            statusElement.className = 'status-queued';
            break;
        case 'executed':
            statusElement.textContent = 'Subscription executed!';
            statusElement.className = 'status-executed';
            break;
        case 'cancelled':
            statusElement.textContent = 'Subscription cancelled!';
            statusElement.className = 'status-cancelled';
            break;
        default:
            statusElement.textContent = 'Unknown status';
            statusElement.className = 'status-unknown';
            break;
    }
}

async function executeSubscription(subscriptionId) {
    try {
        console.log(`Transferring funds for subscription ID: ${subscriptionId} for user: ${userAddress}`);
        const formattedSubscriptionId = web3.utils.padLeft(subscriptionId, 64); // Ensure the subscription ID is correctly formatted

        // Log the formatted subscription ID
        console.log('Formatted Subscription ID:', formattedSubscriptionId);

        // Call the smart contract method to execute the subscription and transfer funds to the hardcoded beneficiary address
        const tx = await transactionPayment.methods.executeSubscription(formattedSubscriptionId).send({ 
            from: userAddress,
            gas: 3000000 // Set a high gas limit for debugging purposes
        });

        console.log('Funds transferred:', tx);
        alert('Funds transferred successfully.');
    } catch (error) {
        console.error('Error transferring funds:', error);

        // Check if the error has a data property with more details
        if (error.data) {
            console.error('Error data:', error.data);
        }

        alert('Failed to transfer funds. Error: ' + error.message);
    }
}

async function cancelSubscription(subscriptionId) {
    try {
        const formattedSubscriptionId = web3.utils.padLeft(subscriptionId, 64); // Ensure the subscription ID is correctly formatted

        const tx = await transactionPayment.methods.cancelSubscription(formattedSubscriptionId).send({
            from: userAddress
        });

        // Log the entire transaction receipt
        console.log('Transaction receipt:', JSON.stringify(tx, null, 2));

        // Checking for a successful transaction
        if (tx.status) {
            console.log('Subscription cancelled successfully');
            localStorage.removeItem('subscriptionId'); // Remove the subscription ID from local storage

            // Fetch and display the updated balance
            const updatedBalance = await web3.eth.getBalance(userAddress);
            const userBalanceElement = document.getElementById('userBalance');
            if (userBalanceElement) {
                userBalanceElement.textContent = web3.utils.fromWei(updatedBalance, 'ether') + ' ETH';
            } else {
                console.error('User balance element not found in the DOM.');
            }
        } else {
            console.error('Transaction failed');
            throw new Error('Transaction failed.');
        }
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        throw error;
    }
}


$(document).ready(async () => {
    await initialize();

    // Toggle dropdown menu
    const userAddressElement = document.getElementById('userAddress');
    const walletDropdown = document.getElementById('walletDropdown');

    userAddressElement.addEventListener('click', () => {
        if (walletDropdown.style.display === 'none' || walletDropdown.style.display === '') {
            walletDropdown.style.display = 'block';
        } else {
            walletDropdown.style.display = 'none';
        }
    });

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

        const isQueued = await queueSubscription(amount, planType, customDays);
        if (isQueued) {
            console.log('Subscription successfully added to the queue.');
        } else {
            console.log('Failed to add subscription to the queue.');
        }
    });

    // Disconnect Wallet
    $('#disconnectButton').click(() => {
        localStorage.removeItem('userAddress');
        alert('Wallet disconnected.');
        location.reload(); // Reload the page to reflect the disconnected state
    });

    // Cancel Subscription
    $('#cancelSubscriptionButton').click(async () => {
        const subscriptionId = prompt('Please enter your subscription ID:');
        if (!subscriptionId) {
            alert('Subscription ID is required to cancel the plan.');
            return;
        }

        try {
            const status = await transactionPayment.methods.getSubscriptionStatus(subscriptionId).call();
            if (status === 'executed') {
                alert('Subscription has already been executed.');
            } else {
                await cancelSubscription(subscriptionId);
                alert('Subscription cancelled and funds refunded.');
                stopTimer()
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            alert('Failed to cancel subscription. Error: ' + error.message);
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