import contractData from '../smart_contract/build/contracts/TransactionPayment.json'; // Import the contract data

const contractAddress = '0x8E4d7e9fAC0DD369Dfc5f21A51565591593f9B18';
const contractABI = contractData.abi;

let web3;
let userAddress;
let transactionPayment;

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            userAddress = accounts[0];
            $('#userAddress').text(`User Address: ${userAddress}`);
            console.log('Connected to MetaMask:', userAddress);

            // Initialize contract
            transactionPayment = new web3.eth.Contract(contractABI, contractAddress);

            return { web3, userAddress };
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
        }
    } else {
        alert('Please install MetaMask!');
    }
}

async function queueTransaction(contract, recipient, amount) {
    const executionTime = Math.floor(Date.now() / 1000) + 60; // Set execution time to 1 minute from now
    try {
        console.log('Queueing transaction with recipient:', recipient, 'amount:', amount);
        const tx = await contract.methods.queueTransaction(recipient, web3.utils.toWei(amount.toString(), 'ether'), executionTime).send({
            from: userAddress,
            value: web3.utils.toWei(amount.toString(), 'ether')
        });
        console.log('Transaction queued:', tx);
        alert('Transaction queued successfully!');
    } catch (error) {
        console.error('Error queuing transaction:', error);
        alert('Failed to queue transaction.');
    }
}

$(document).ready(async () => {
    const { web3, userAddress } = await connectWallet();

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
        await queueTransaction(transactionPayment, userAddress, amount);
    });
});