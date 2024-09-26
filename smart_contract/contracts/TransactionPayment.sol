    pragma solidity ^0.8.0;

    interface IUserManagement {
        function isUserRegistered(address _user) external view returns (bool);
    }

    contract TransactionPayment {
        // Declare the userManagement variable to store the UserManagement contract instance
        IUserManagement public userManagement;

        struct Subscription {
            address payable subscriber;
            uint amount;
            uint unlockTime;
            bool cancelled;
            bool executed;
        }

        // Constructor to initialize the user management contract address
        constructor(address _userManagementAddress) {
            userManagement = IUserManagement(_userManagementAddress); // Initialize the contract instance
        }
        
        mapping(uint => Subscription) public subscriptions;
        mapping(address => uint) public userToSubscriptionId; // Tracks a single active subscription per user

        // Events
        event SubscriptionQueued(uint indexed subscriptionId, address indexed subscriber, uint256 unlockTime);
        event SubscriptionCancelled(uint indexed subscriptionId);
        event SubscriptionExecuted(uint indexed subscriptionId, address indexed beneficiary, uint amount);

            // Modifier to check if the user is registered
    modifier onlyRegisteredUser() {
        require(userManagement.isUserRegistered(msg.sender), "User must be registered");
        _;
    }


        // Queue a subscription payment
        function queueSubscription(uint _unlockTime) external payable returns (uint) {
            require(msg.value > 0, "No ETH sent for subscription");
            require(_unlockTime > block.timestamp, "Unlock time must be in the future");

            // Check if the user is registered
            require(userManagement.isUserRegistered(msg.sender), "User must be registered to buy a subscription");

            // Generate a 5-digit random subscription ID
            uint subscriptionId = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 100000;

            // Ensure the subscription ID is unique
            while (subscriptions[subscriptionId].subscriber != address(0)) {
                subscriptionId = (subscriptionId + 1) % 100000;
            }

            // Ensure the user doesn't have another active subscription
            require(userToSubscriptionId[msg.sender] == 0, "Active subscription already exists for user");

            // Create the subscription record
            subscriptions[subscriptionId] = Subscription({
                subscriber: payable(msg.sender),
                amount: msg.value,
                unlockTime: _unlockTime,
                cancelled: false,
                executed: false
            });

            // Link the subscription ID to the user's address
            userToSubscriptionId[msg.sender] = subscriptionId;

            // Emit the SubscriptionQueued event
            emit SubscriptionQueued(subscriptionId, msg.sender, _unlockTime);

            return subscriptionId;
        }

        // Cancel the subscription and refund the money to the subscriber
        function cancelSubscription(uint _subscriptionId) external {
            Subscription storage sub = subscriptions[_subscriptionId];
            require(msg.sender == sub.subscriber, "Only the subscriber can cancel");
            require(!sub.cancelled, "Subscription already cancelled");
            require(!sub.executed, "Subscription already executed");

            // Mark the subscription as cancelled
            sub.cancelled = true;

            // Refund the money to the subscriber
            sub.subscriber.transfer(sub.amount);
            emit SubscriptionCancelled(_subscriptionId);
        }

        // Execute the subscription payment when the unlock time has passed
        function executeSubscription(uint _subscriptionId, address payable _beneficiary) external onlyRegisteredUser {
            Subscription storage sub = subscriptions[_subscriptionId];
            require(block.timestamp >= sub.unlockTime, "Unlock time not reached");
            require(!sub.cancelled, "Subscription has been cancelled");
            require(!sub.executed, "Subscription already executed");

            // Mark the subscription as executed
            sub.executed = true;

            // Transfer the locked funds to the beneficiary (e.g., movie platform)
            _beneficiary.transfer(sub.amount);

            emit SubscriptionExecuted(_subscriptionId, _beneficiary, sub.amount);
        }

        // Check the status of the user's active subscription
        function getSubscriptionStatus(address _user) external view returns (string memory) {
            uint subscriptionId = userToSubscriptionId[_user];
            require(subscriptionId != 0, "No active subscription for this user");

            Subscription memory sub = subscriptions[subscriptionId];
            if (sub.cancelled) {
                return "Cancelled";
            } else if (sub.executed) {
                return "Executed";
            } else {
                return "Queued";
            }
        }

        // View details of the user's current subscription
        function getCurrentSubscription(address _user) external view returns (Subscription memory) {
            uint subscriptionId = userToSubscriptionId[_user];
            require(subscriptionId != 0, "No active subscription for this user");

            return subscriptions[subscriptionId];
        }
    }
