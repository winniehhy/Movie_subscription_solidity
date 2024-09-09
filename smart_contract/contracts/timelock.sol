// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TimeLock {
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        uint256 executionTime;
        bool executed;
        bool canceled;
    }

    mapping(bytes32 => Transaction) public transactions;
    address public owner;

    event TransactionQueued(bytes32 txId, address indexed to, uint256 value, bytes data, uint256 executionTime);
    event TransactionExecuted(bytes32 txId);
    event TransactionCanceled(bytes32 txId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function queueTransaction(address _to, uint256 _value, bytes memory _data, uint256 _executionTime) public onlyOwner returns (bytes32) {
        require(_executionTime > block.timestamp, "Execution time must be in the future");

        bytes32 txId = keccak256(abi.encode(_to, _value, _data, _executionTime));
        transactions[txId] = Transaction({
            to: _to,
            value: _value,
            data: _data,
            executionTime: _executionTime,
            executed: false,
            canceled: false
        });

        emit TransactionQueued(txId, _to, _value, _data, _executionTime);
        return txId;
    }

    function executeTransaction(bytes32 _txId) public {
        Transaction storage txn = transactions[_txId];
        require(block.timestamp >= txn.executionTime, "Transaction not ready for execution");
        require(!txn.executed, "Transaction already executed");
        require(!txn.canceled, "Transaction has been canceled");

        (bool success, ) = txn.to.call{value: txn.value}(txn.data);
        require(success, "Transaction execution failed");

        txn.executed = true;
        emit TransactionExecuted(_txId);
    }

    function cancelTransaction(bytes32 _txId) public onlyOwner {
        Transaction storage txn = transactions[_txId];
        require(!txn.executed, "Transaction already executed");
        txn.canceled = true;
        emit TransactionCanceled(_txId);
    }

    function adjustTransaction(bytes32 _txId, uint256 newExecutionTime, address newBeneficiary) public onlyOwner {
        Transaction storage txn = transactions[_txId];
        require(!txn.executed, "Transaction already executed");
        require(!txn.canceled, "Transaction has been canceled");

        txn.executionTime = newExecutionTime;
        txn.to = newBeneficiary;
    }
}
