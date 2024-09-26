import contractData from '/../smart_contract/build/contracts/NotificationManagement.json';
// import contractData from '/../smart_contract/build/contracts/UserManager.json';
const contractAddress = contractData.networks[5777]?.address;  // smart contract address
const contractABI = contractData.abi; // smart contract's ABI

let userAddress = null;

async function initialize() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = localStorage.getItem('userAddress');
            if (userAddress) {
                loadNotifications();
                loadNotificationHistory();
            } else {
                alert('Please connect your wallet!');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            alert('Error connecting to MetaMask. Please try again.');
        }
    } else {
        alert('Please install MetaMask!');
        window.location.href = 'index.html';
    }
}

const userNotificationsKey = () => `notifications_${userAddress}`;
const userReadNotificationsKey = () => `readNotifications_${userAddress}`;

async function loadNotifications() {
    const newNotifications = document.getElementById('newNotifications');
    let notifications = JSON.parse(localStorage.getItem(userNotificationsKey())) || [];

    // Check for expiring subscriptions and add upcoming renewal notifications
    const expiringSubscriptions = getExpiringSubscriptions();
    expiringSubscriptions.forEach(subscription => {
        const renewalNotification = {
            message: `Your subscription for ${subscription.planType} is expiring soon.`,
            timestamp: Date.now(),
            planType: subscription.planType,
            subscriptionId: subscription.subscriptionId,
            startDate: subscription.startDate,
            endDate: subscription.endDate
        };
        notifications.push(renewalNotification);
    });

    // Update the notification count
    const notificationCount = document.getElementById('notificationCount');
    notificationCount.textContent = notifications.length > 0 ? notifications.length : '';

    newNotifications.innerHTML = '';

    if (notifications.length === 0) {
        newNotifications.innerHTML = '<p>No new notifications.</p>';
        return;
    }

    notifications.forEach((notification, index) => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';

        // Create the inner HTML for the notification
        notificationItem.innerHTML = `
            <p><strong>${notification.message}</strong> <small>${new Date(notification.timestamp).toLocaleString()}</small></p>
            <div class="notification-buttons">
                <button class="btn" onclick="viewNotification(${index})">View Notification</button>
                <button class="btn" onclick="markAsRead(${index})">Mark as Read</button>
            </div>
            <div id="countdown-${index}" style="margin-top: 5px; font-weight: bold; color: #ff0000;"></div>
        `;

        newNotifications.appendChild(notificationItem);

        // Now that the countdown div is part of the DOM, we can reference it
        const countdownElement = document.getElementById(`countdown-${index}`);
        startNotificationCountdown(notification, countdownElement);
    });

    // Save the updated notifications back to localStorage
    localStorage.setItem(userNotificationsKey(), JSON.stringify(notifications));
}

function getExpiringSubscriptions() {
    // Retrieve subscriptions from localStorage or your data source
    const subscriptions = JSON.parse(localStorage.getItem('userSubscriptions')) || [];
    const expiringSubscriptions = [];
    const oneDayInMs = 24 * 60 * 60 * 1000;

    subscriptions.forEach(subscription => {
        const endDate = new Date(subscription.endDate).getTime();
        const currentTime = Date.now();
        const timeLeft = endDate - currentTime;

        if (timeLeft > 0 && timeLeft <= oneDayInMs) {
            expiringSubscriptions.push(subscription);
        }
    });

    return expiringSubscriptions;
}

function startNotificationCountdown(notification, countdownElement) {
    if (!notification.endDate) {
        countdownElement.textContent = '';
        return;
    }

    const endDate = new Date(notification.endDate).getTime();
    const countdownInterval = setInterval(() => {
        const currentTime = Date.now();
        const timeLeft = endDate - currentTime;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownElement.textContent = 'Subscription expired!';
            return;
        }

        const totalHours = Math.floor(timeLeft / (1000 * 60 * 60)); 
        const days = Math.floor(totalHours / 24); 
        const hours = totalHours % 24; 
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        if (days <= 1 && days >= 0) {
            countdownElement.innerHTML = `<span style="color:yellow; font-weight:bold;">Upcoming Subscription Renewal!</span><span style="color:white; font-weight:bold;"> Subscription Expires in:</span> ${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
        countdownElement.textContent = `Time left: ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
    }, 1000);
}

async function loadNotificationHistory() {
    const notificationHistoryDiv = document.getElementById('notificationHistory');
    const readNotifications = JSON.parse(localStorage.getItem(userReadNotificationsKey())) || [];

    notificationHistoryDiv.innerHTML = '';

    if (readNotifications.length === 0) {
        notificationHistoryDiv.innerHTML = '<p>No notification history.</p>';
        return;
    }

    readNotifications.forEach((notification) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'notification-item';
        
        historyItem.innerHTML = `
            <p><strong>${notification.message}</strong></p>
            <p>Plan Type: ${notification.planType}</p>
            <p>Start Date: ${new Date(notification.startDate).toLocaleDateString()}</p>
            <p>End Date: ${new Date(notification.endDate).toLocaleDateString()}</p>
            <small>Notification received on: ${new Date(notification.timestamp).toLocaleString()}</small>
        `;

        notificationHistoryDiv.appendChild(historyItem);
    });
}

function viewNotification(index) {
    const notifications = JSON.parse(localStorage.getItem(userNotificationsKey())) || [];
    const notification = notifications[index];

    const details = `
        Subscription Details:
        ------------------------
        Plan Type: ${notification.planType}
        Subscription ID: ${notification.subscriptionId}
        Start Date: ${notification.startDate}
        End Date: ${notification.endDate}
        
        ------------------------
    `;
    alert(details);
}

function markAsRead(index) {
    const notifications = JSON.parse(localStorage.getItem(userNotificationsKey())) || [];
    const [readNotification] = notifications.splice(index, 1);
    localStorage.setItem(userNotificationsKey(), JSON.stringify(notifications));

    const readNotifications = JSON.parse(localStorage.getItem(userReadNotificationsKey())) || [];
    readNotifications.push(readNotification);
    localStorage.setItem(userReadNotificationsKey(), JSON.stringify(readNotifications));

    loadNotifications();
    loadNotificationHistory();
}



function filterNotifications() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const selectedDate = document.getElementById('dateFilter').value; // yyyy-mm-dd format
    const notifications = JSON.parse(localStorage.getItem(userNotificationsKey())) || [];
    const newNotificationsDiv = document.getElementById('newNotifications');

    newNotificationsDiv.innerHTML = ''; // Clear previous results

    const filteredNotifications = notifications.filter(notification => {
        // Check for valid startDate and endDate
        if (!notification.startDate || !notification.endDate) return false;

        const formattedStartDate = new Date(notification.startDate).toISOString().split('T')[0];
        const formattedEndDate = new Date(notification.endDate).toISOString().split('T')[0];

        const matchesSearch = notification.message.toLowerCase().includes(searchValue);
        const matchesDate = selectedDate ? (formattedStartDate === selectedDate || formattedEndDate === selectedDate) : true;

        return matchesSearch && matchesDate;
    });

    if (filteredNotifications.length === 0) {
        newNotificationsDiv.innerHTML = '<p>No matching notifications.</p>';
        return;
    }

    filteredNotifications.forEach((notification, index) => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';

        notificationItem.innerHTML = `                
            <p><strong>${notification.message}</strong> <small>${new Date(notification.timestamp).toLocaleString()}</small></p>
            <div class="notification-buttons">
                <button class="btn" onclick="viewNotification(${index})">View Notification</button>
                <button class="btn" onclick="markAsRead(${index})">Mark as Read</button>
            </div>
        `;

        const countdownElement = document.createElement('div');
        countdownElement.id = `countdown-${index}`;
        countdownElement.style.marginTop = '5px';
        countdownElement.style.fontWeight = 'bold';
        countdownElement.style.color = '#ff0000';
        notificationItem.appendChild(countdownElement);

        newNotificationsDiv.appendChild(notificationItem);

        // Start countdown for each filtered notification
        startNotificationCountdown(notification, countdownElement);
    });
}




function filterHistoryNotifications() {
    const searchValue = document.getElementById('searchHistoryInput').value.toLowerCase();
    const selectedDate = document.getElementById('dateFilterHistory').value;
    const readNotifications = JSON.parse(localStorage.getItem(userReadNotificationsKey())) || [];
    const notificationHistoryDiv = document.getElementById('notificationHistory');

    notificationHistoryDiv.innerHTML = '';

    const filteredHistory = readNotifications.filter(notification => {
        if (!notification.startDate || !notification.endDate) return false;

        const formattedStartDate = new Date(notification.startDate).toISOString().split('T')[0];
        const formattedEndDate = new Date(notification.endDate).toISOString().split('T')[0];

        const matchesSearch = notification.message.toLowerCase().includes(searchValue);
        const matchesDate = selectedDate ? (formattedStartDate === selectedDate || formattedEndDate === selectedDate) : true;

        return matchesSearch && matchesDate;
    });

    if (filteredHistory.length === 0) {
        notificationHistoryDiv.innerHTML = '<p>No matching notification history.</p>';
        return;
    }

    filteredHistory.forEach(notification => {
        const historyItem = document.createElement('div');
        historyItem.className = 'notification-item';

        historyItem.innerHTML = `
            <p><strong>${notification.message}</strong></p>
            <p>Plan Type: ${notification.planType}</p>
            <p>Start Date: ${new Date(notification.startDate).toLocaleDateString()}</p>
            <p>End Date: ${new Date(notification.endDate).toLocaleDateString()}</p>
            <small>Notification received on: ${new Date(notification.timestamp).toLocaleString()}</small>
        `;
        
        notificationHistoryDiv.appendChild(historyItem);
    });
}


window.viewNotification = viewNotification;
window.markAsRead = markAsRead;
window.showTab = showTab;

function showTab(tabId, activeTabId) {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    document.getElementById(activeTabId).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    initialize();
    document.getElementById('searchInput').oninput = filterNotifications;
    document.getElementById('dateFilter').onchange = filterNotifications;
    document.getElementById('searchHistoryInput').oninput = filterHistoryNotifications;
    document.getElementById('dateFilterHistory').onchange = filterHistoryNotifications;
    document.getElementById('clearStorageButton').onclick = function() {
        localStorage.removeItem(userNotificationsKey());
        localStorage.removeItem(userReadNotificationsKey());
        loadNotifications();
        loadNotificationHistory();
   
        alert('All notification data cleared.');

    };

    document.getElementById('disconnectButton').onclick = function() {
        userAddress = null;
        document.getElementById('newNotifications').innerHTML = '<p>No new notifications.</p>';
        document.getElementById('notificationHistory').innerHTML = '<p>No notification history.</p>';
        document.getElementById('notificationCount').textContent = '';
        localStorage.removeItem(userNotificationsKey());
        localStorage.removeItem(userReadNotificationsKey());
        alert('Wallet disconnected. Notifications cleared.');
    };

    setInterval(() => {
        checkForExpiringSubscriptions();
    }, 60000);
});
