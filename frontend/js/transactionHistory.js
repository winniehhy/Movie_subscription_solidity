import userManagerData from '../../smart_contract/build/contracts/UserManager.json';
import transactionPaymentData from '../../smart_contract/build/contracts/TransactionPayment.json';

const userManagerAddress = userManagerData.networks[5777]?.address;
const userManagerABI = userManagerData.abi;

const transactionPaymentAddress = transactionPaymentData.networks[5777]?.address;
const transactionPaymentABI = transactionPaymentData.abi;

let web3;
let userManager;
let transactionPayment;

window.addEventListener("load", async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        userManager = new web3.eth.Contract(userManagerABI, userManagerAddress);
        transactionPayment = new web3.eth.Contract(transactionPaymentABI, transactionPaymentAddress);
        await updateTable('September');
    } else {
        alert("MetaMask is not installed. Please install MetaMask and try again.");
    }
});

document.getElementById('monthForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const selectedMonth = document.getElementById('monthSelect').value;
    console.log(`Selected month: ${selectedMonth}`); // Debug log
    updateTable(selectedMonth);
});

async function updateTable(month) {
    const data = {
        January: [
            { name: 'Emily', id: '0x00000000000000000000000000000000000000000000000000000000053a6', status: 'Executed' },
            { name: 'Jane Smi', id: '0x0000000000000000000000000000000000000000000000000000000000012345', status: 'Executed' },
        ],
        February: [
            { name: 'Alice Brown', id: '0x000000000000000000000000000000000000000000000000000000000002t334', status: 'Cancelled' },
            { name: 'Bob White', id: '0x000000000000000000000000000000000000000000000000000003e445', status: 'Executed' },
            { name: 'Charlie Black', id: '0x00000000000000000000000000000000000000000000000000000000000a1556', status: 'Cancelled' }
        ],
        March: [
            { name: 'David Green', id: '0x000000000000000000000000000000000000000000000000000000000004d556', status: 'Executed' },
        ],
        April: [
            { name: 'Eve Blue', id: '0x000000000000000000000000000000000000000000000000000000000005e667', status: 'Cancelled' },
        ],
        May: [
            { name: 'Frank Yellow', id: '0x000000000000000000000000000000000000000000000000000000000006f778', status: 'Executed' },
        ],
        June: [
            { name: 'Grace Pink', id: '0x000000000000000000000000000000000000000000000000000000000007g889', status: 'Cancelled' },
        ],
        July: [
            { name: 'Hank Purple', id: '0x000000000000000000000000000000000000000000000000000000000008h990', status: 'Executed' },
        ],
        August: [
            { name: 'Ivy Orange', id: '0x000000000000000000000000000000000000000000000000000000000009i101', status: 'Cancelled' },
        ],
        September: await fetchSeptemberData(), // Fetch data for September dynamically
        October: [],
        November: [],
        December: [],
    };

    const tableBody = document.querySelector('#userTable tbody');
    tableBody.innerHTML = ''; // Clear the table body

    if (data[month]) {
        data[month].forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.id}</td>
                <td class="status">${user.status}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    setStatusColors();
}

async function fetchSeptemberData() {
    try {
        const users = await userManager.methods.getAllUsers().call();
        console.log("Fetched Users from UserManager contract:", users); // Debug
        const septemberData = [];

        for (const user of users) {
            console.log("Processing user:", user); // Debug
            const subscriptionId = await transactionPayment.methods.queueSubscription(30 * 24 * 60 * 60).call({ from: user.userAddress });
            const status = await transactionPayment.methods.getSubscriptionStatus(subscriptionId).call();
            septemberData.push({ name: user.username, id: subscriptionId, status });
        }

        return septemberData;
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}



function setStatusColors() {
    const statusCells = document.querySelectorAll('#userTable .status');
    statusCells.forEach(cell => {
        if (cell.textContent === 'Executed') {
            cell.style.color = 'green';
        } else if (cell.textContent === 'Cancelled') {
            cell.style.color = 'red';
        }
    });
}

// Initial call to set colors for the default table content
setStatusColors();