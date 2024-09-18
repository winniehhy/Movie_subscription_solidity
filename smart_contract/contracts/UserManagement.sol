// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserManager {
    struct User {
        string username;
        string email;
        address userAddress;
        uint lastUpdated; // Tracks the last time the profile was updated
    }

    struct Subscription {
        string movieTitle;
        uint256 subscriptionDate;
    }

    mapping(address => User) public users;
    mapping(address => Subscription[]) public subscriptionHistory; // Track subscription history

    event UserRegistered(address indexed userAddress, string username, string email);
    event ProfileUpdated(address indexed userAddress, string username, string email);
    event SubscriptionAdded(address indexed userAddress, string movieTitle, uint256 subscriptionDate);

    // Register the user
    function registerUser(string memory username, string memory email) public {
        require(bytes(users[msg.sender].username).length == 0, "User already registered");
        users[msg.sender] = User({
            username: username,
            email: email,
            userAddress: msg.sender,
            lastUpdated: block.timestamp
        });

        // Emit event after successful registration
        emit UserRegistered(msg.sender, username, email);
    }

    // Update profile details with 24-hour restriction
    function updateProfile(string memory _newUsername, string memory _newEmail) public {
        require(bytes(users[msg.sender].username).length > 0, "User not registered");
        require(block.timestamp >= users[msg.sender].lastUpdated + 24 hours, "Profile can only be updated once every 24 hours");

        users[msg.sender].username = _newUsername;
        users[msg.sender].email = _newEmail;
        users[msg.sender].lastUpdated = block.timestamp; // Update the timestamp

        emit ProfileUpdated(msg.sender, _newUsername, _newEmail);
    }

    // Add a subscription to the user's history
    function addSubscription(string memory _movieTitle) public {
        require(bytes(users[msg.sender].username).length > 0, "User not registered");

        subscriptionHistory[msg.sender].push(Subscription(_movieTitle, block.timestamp));

        emit SubscriptionAdded(msg.sender, _movieTitle, block.timestamp);
    }

    // Get user profile
    function getProfile() public view returns (string memory, string memory, address, uint) {
        require(bytes(users[msg.sender].username).length != 0, "User not registered");
        User memory user = users[msg.sender];
        return (user.username, user.email, user.userAddress, user.lastUpdated);
    }

    // Get subscription history for the user
    function getSubscriptionHistory() public view returns (Subscription[] memory) {
        require(bytes(users[msg.sender].username).length != 0, "User not registered");
        return subscriptionHistory[msg.sender];
    }
}
