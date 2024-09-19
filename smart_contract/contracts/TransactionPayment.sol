// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransactionPayment {
    struct Transaction {
        address payable recipient;
        uint256 amount;
        uint256 executionTime;
        bool executed;
        bool canceled;
    }

    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;

    event TransactionQueued(uint256 transactionId, address indexed recipient, uint256 amount, uint256 executionTime);
    event TransactionExecuted(uint256 transactionId, address indexed recipient, uint256 amount);
    event TransactionCanceled(uint256 transactionId);

    // Queue a transaction to be executed in the future
    function queueTransaction(address payable _recipient, uint256 _amount, uint256 _executionTime) external payable {
        require(_amount == msg.value, "The amount of ether sent must match the transaction amount.");
        require(_executionTime > block.timestamp, "Execution time must be in the future.");

        transactionCount++;
        transactions[transactionCount] = Transaction({
            recipient: _recipient,
            amount: _amount,
            executionTime: _executionTime,
            executed: false,
            canceled: false
        });

        emit TransactionQueued(transactionCount, _recipient, _amount, _executionTime);
    }

    // Execute a transaction once the execution time has passed
    function executeTransaction(uint256 _transactionId) external {
        Transaction storage txn = transactions[_transactionId];
        require(!txn.executed, "Transaction has already been executed.");
        require(!txn.canceled, "Transaction has been canceled.");
        require(block.timestamp >= txn.executionTime, "Transaction cannot be executed yet.");

        txn.executed = true;
        txn.recipient.transfer(txn.amount);

        emit TransactionExecuted(_transactionId, txn.recipient, txn.amount);
    }

    // Cancel a queued transaction before execution
    function cancelTransaction(uint256 _transactionId) external {
        Transaction storage txn = transactions[_transactionId];
        require(!txn.executed, "Cannot cancel an already executed transaction.");
        require(!txn.canceled, "Transaction is already canceled.");
        
        txn.canceled = true;
        payable(msg.sender).transfer(txn.amount); // Refund the amount to the sender

        emit TransactionCanceled(_transactionId);
    }
}
