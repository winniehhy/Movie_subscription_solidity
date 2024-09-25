// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NotificationManagement {
    struct Notification {
        string message;
        uint256 timestamp;
        bool isRead;
    }

    mapping(address => Notification[]) private notifications;

    event NotificationCreated(address indexed userAddress, string message, uint256 timestamp);

    // Add a notification for a user
    function addNotification(address _userAddress, string memory _message) internal {
        notifications[_userAddress].push(Notification({
            message: _message,
            timestamp: block.timestamp,
            isRead: false
        }));
        emit NotificationCreated(_userAddress, _message, block.timestamp);
    }

    // Retrieve notifications for a user
    function getNotifications() public view returns (Notification[] memory) {
        return notifications[msg.sender];
    }

    // Mark a notification as read
    function markAsRead(uint256 index) public {
        require(index < notifications[msg.sender].length, "Invalid index");
        notifications[msg.sender][index].isRead = true;
    }

    // Example function to trigger a notification for subscription update
    function notifySubscriptionUpdate(address _userAddress, string memory _movieTitle) public {
        string memory message = string(abi.encodePacked("Your subscription for ", _movieTitle, " has been updated."));
        addNotification(_userAddress, message);
    }

    // Example function to trigger a notification for transaction status
    function notifyTransactionStatus(address _userAddress, string memory _status) public {
        string memory message = string(abi.encodePacked("Transaction status: ", _status));
        addNotification(_userAddress, message);
    }
}
