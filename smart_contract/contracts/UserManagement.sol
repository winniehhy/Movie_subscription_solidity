// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITransactionPayment {
    function hasActiveSubscription(address user) external view returns (bool);
    function getCurrentSubscription(address user) external view returns (address, uint, uint, bool, bool);
}

contract UserManagement {
    address public owner;
    ITransactionPayment public transactionPayment;

    struct User {
        string username;
        string email;
        address userAddress;
        uint lastUpdated;
        uint nextUpdateTime;
    }

    mapping(address => User) public users;
    mapping(string => bool) private usernames; // Mapping to prevent duplicate usernames
    mapping(string => bool) private emails; // Mapping to prevent duplicate emails
    mapping(address => bool) public hasActiveSubscription; // Tracks active subscriptions

    event UserRegistered(address indexed userAddress, string username, string email);
    event ProfileUpdated(address indexed userAddress, string username, string email);
    event MovieAdded(string title, string genre);

    address[] private userAddresses;

    // constructor(address _transactionPaymentAddress) {
    //     owner = msg.sender;
    //     transactionPayment = ITransactionPayment(_transactionPaymentAddress);
    // }

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

        // Internal function to check if the username exists
    function isUsernameTaken(string memory username) public view returns (bool) {
        return usernames[username];
    }

    // Internal function to check if the email exists
    function isEmailTaken(string memory email) public view returns (bool) {
        return emails[email];
    }

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
            nextUpdateTime: 0
        });

        usernames[username] = true; // Mark username as taken
        emails[email] = true; // Mark email as taken

        emit UserRegistered(msg.sender, username, email);
    }

    function updateProfile(string memory _newUsername, string memory _newEmail) public {
        require(
            bytes(users[msg.sender].username).length > 0,
            "User not registered"
        );

        require(!usernames[_newUsername] || keccak256(bytes(_newUsername)) == keccak256(bytes(users[msg.sender].username)),
            "Username is already taken");
        require(!emails[_newEmail] || keccak256(bytes(_newEmail)) == keccak256(bytes(users[msg.sender].email)),
            "Email is already taken");

        users[msg.sender].username = _newUsername;
        users[msg.sender].email = _newEmail;
        users[msg.sender].lastUpdated = block.timestamp;
        users[msg.sender].nextUpdateTime = block.timestamp + 1 days;

        emit ProfileUpdated(msg.sender, _newUsername, _newEmail);
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

    function getUserSubscriptionInfo() public view returns (
        uint amount,
        uint unlockTime,
        bool cancelled,
        bool executed
    ) {
        require(
            bytes(users[msg.sender].username).length != 0,
            "User not registered"
        );

        (address subscriber, uint subAmount, uint subUnlockTime, bool subCancelled, bool subExecuted) = transactionPayment.getCurrentSubscription(msg.sender);
        require(subscriber != address(0), "No active subscription found");

        return (subAmount, subUnlockTime, subCancelled, subExecuted);
    }

    function isUserRegistered(address userAddress) public view returns (bool) {
        return bytes(users[userAddress].username).length != 0;
    }

    function addMovie(string memory title, string memory genre) public onlyOwner {
        emit MovieAdded(title, genre);
    }


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
