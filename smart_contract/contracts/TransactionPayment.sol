pragma solidity ^0.8.0;

contract TransactionPayment {
    struct Subscription {
        address payable subscriber;
        uint amount;
        uint unlockTime;
        bool cancelled;
        bool executed;
    }

    mapping(bytes32 => Subscription) public subscriptions;

    // Events
    event SubscriptionQueued(bytes32 indexed subscriptionId, address indexed subscriber, uint256 unlockTime);
    event SubscriptionCancelled(bytes32 indexed subscriptionId);
    event SubscriptionExecuted(bytes32 indexed subscriptionId, address indexed beneficiary, uint amount);

    // Queue a subscription payment
function queueSubscription(uint _unlockTime) external payable returns (uint) {
    require(msg.value > 0, "No ETH sent for subscription");
    require(_unlockTime > block.timestamp, "Unlock time must be in the future");

    // Generate a 5-digit random subscription ID
    uint subscriptionId = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 100000;

    // Ensure the subscription ID is unique
    while (subscriptions[bytes32(subscriptionId)].subscriber != address(0)) {
        subscriptionId = (subscriptionId + 1) % 100000;
    }

    // Create the subscription record
    subscriptions[bytes32(subscriptionId)] = Subscription({
        subscriber: payable(msg.sender),
        amount: msg.value,
        unlockTime: _unlockTime,
        cancelled: false,
        executed: false
    });

    // Emit the SubscriptionQueued event
    emit SubscriptionQueued(bytes32(subscriptionId), msg.sender, _unlockTime);

    return subscriptionId;
}

      // Cancel the subscription and refund the money to the subscriber
    function cancelSubscription(bytes32 _subscriptionId) external {
        Subscription storage sub = subscriptions[_subscriptionId];
        require(msg.sender == sub.subscriber, "Only the subscriber can cancel");
        require(!sub.cancelled, "Subscription already cancelled");
        require(!sub.executed, "Subscription already executed");

        // Mark the subscription as cancelled
        sub.cancelled = true;
        
        // Refund the money to the subscriber
        sub.subscriber.transfer(sub.amount);
        // Emit the SubscriptionCancelled event
        emit SubscriptionCancelled(_subscriptionId);
    }


    // Execute the subscription payment when the unlock time has passed
    function executeSubscription(bytes32 _subscriptionId, address payable _beneficiary) external {
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

    // Check the status of a subscription (queued, executed, or cancelled)
    function getSubscriptionStatus(bytes32 _subscriptionId) external view returns (string memory) {
        Subscription memory sub = subscriptions[_subscriptionId];
        if (sub.cancelled) {
            return "Cancelled";
        } else if (sub.executed) {
            return "Executed";
        } else {
            return "Queued";
        }
    }
}