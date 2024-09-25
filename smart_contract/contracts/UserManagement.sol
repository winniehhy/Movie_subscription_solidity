// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserManager {
    address public owner;

    struct User {
        string username;
        string email;
        address userAddress;
        uint lastUpdated; // Tracks the last time the profile was updated
        uint nextUpdateTime; // Tracks the next time the profile can be updated
        bool isUpdated; // New flag to track if the profile has been updated
        // bool hasActiveSubscription;  
    }

    struct Subscription {
        string movieTitle;
        uint256 subscriptionDate;
    }

    mapping(address => User) public users;
    mapping(string => bool) private usernames; // Mapping to prevent duplicate usernames
    mapping(string => bool) private emails; // Mapping to prevent duplicate emails
    mapping(address => bool) public hasActiveSubscription; // Tracks active subscriptions
    mapping(address => Subscription[]) public subscriptionHistory; // Track subscription history

    address[] private userAddresses;

    event UserRegistered(
        address indexed userAddress,
        string username,
        string email
    );
    event ProfileUpdated(
        address indexed userAddress,
        string username,
        string email
    );
    event SubscriptionAdded(
        address indexed userAddress,
        string movieTitle,
        uint256 subscriptionDate
    );
    event MovieAdded(string title, string genre);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

//     modifier onlySubscribed() {
//     require(users[msg.sender].hasActiveSubscription, "You must have an active subscription to perform this action");
//     _;
// }

    function registerUser(string memory username, string memory email) public {
        require(
            bytes(users[msg.sender].username).length == 0,
            "User already registered"
        );
        require(!usernames[username], "Username is already taken");
        require(!emails[email], "Email is already taken");

        users[msg.sender] = User({
            username: username,
            email: email,
            userAddress: msg.sender,
            lastUpdated: 0,
            nextUpdateTime: 0,
            isUpdated: false
        });

         // Push the user's address to the userAddresses array
            userAddresses.push(msg.sender);

        usernames[username] = true; // Mark username as taken
        emails[email] = true; // Mark email as taken

        emit UserRegistered(msg.sender, username, email);
    }

//     // Function to update subscription status, callable by TransactionPayment.sol
// function setSubscriptionStatus(address _user, bool _status) external {
//     require(msg.sender == addressOfTransactionPaymentContract, "Only TransactionPayment can call this");
//     hasActiveSubscription[_user] = _status;
// }

    function isUsernameTaken(string memory username) public view returns (bool) {
    return usernames[username];
}

// Check if the email is taken
function isEmailTaken(string memory email) public view returns (bool) {
    return emails[email];
}

    function updateProfile(string memory _newUsername, string memory _newEmail) public {
        require(
            bytes(users[msg.sender].username).length > 0,
            "User not registered"
        );

        // Prevent profile update if the username or email is already taken by someone else
        require(!usernames[_newUsername] || keccak256(bytes(_newUsername)) == keccak256(bytes(users[msg.sender].username)),
            "Username is already taken");
        require(!emails[_newEmail] || keccak256(bytes(_newEmail)) == keccak256(bytes(users[msg.sender].email)),
            "Email is already taken");

        // Profile update logic
        if (!users[msg.sender].isUpdated) {
            // Allow update if profile has not been updated before
            users[msg.sender].isUpdated = true;
        } else {
            // Allow profile update only if 24 hours have passed
            require(
                block.timestamp >= users[msg.sender].nextUpdateTime,
                "Profile can only be updated once every 24 hours"
            );
        }

        // Update the profile details
        users[msg.sender].username = _newUsername;
        users[msg.sender].email = _newEmail;
        users[msg.sender].lastUpdated = block.timestamp;
        users[msg.sender].nextUpdateTime = block.timestamp + 1 days;
        users[msg.sender].isUpdated = true;

        emit ProfileUpdated(msg.sender, _newUsername, _newEmail);
    }

    function addSubscription(string memory _movieTitle) public {
        require(
            bytes(users[msg.sender].username).length > 0,
            "User not registered"
        );

        subscriptionHistory[msg.sender].push(
            Subscription(_movieTitle, block.timestamp)
        );

        emit SubscriptionAdded(msg.sender, _movieTitle, block.timestamp);
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getProfile() public view returns (string memory, string memory, address, uint, uint) {
        require(
            bytes(users[msg.sender].username).length != 0,
            "User not registered"
        );
        User memory user = users[msg.sender];

        return (
            user.username,
            user.email,
            user.userAddress,
            user.lastUpdated,
            user.nextUpdateTime
        );
    }

    function getSubscriptionHistory() public view returns (Subscription[] memory) {
        require(
            bytes(users[msg.sender].username).length != 0,
            "User not registered"
        );
        return subscriptionHistory[msg.sender];
    }

    function isUserRegistered(address userAddress) public view returns (bool) {
        return bytes(users[userAddress].username).length != 0;
    }

    function addMovie(string memory title, string memory genre) public onlyOwner {
        emit MovieAdded(title, genre);
    }

//     function getSubscriptionHistory() public view onlySubscribed returns (Subscription[] memory) {
//     // Ensure user is registered and return subscription history
//     require(bytes(users[msg.sender].username).length != 0, "User not registered");
//     return subscriptionHistory[msg.sender];
// }


//-------Added to retrieve user details and show in transactionHistory-----
function getUserAddresses() public view returns (address[] memory) {
    return userAddresses;
}

function getAllUsers() public view returns (User[] memory) {
        User[] memory allUsers = new User[](userAddresses.length);
        for (uint i = 0; i < userAddresses.length; i++) {
            allUsers[i] = users[userAddresses[i]];
        }
        return allUsers;
    }
}
