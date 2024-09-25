const UserManagement = artifacts.require("UserManagement");
const TransactionPayment = artifacts.require("TransactionPayment");
const MovieVoting = artifacts.require("MovieVoting");

module.exports = function(deployer) {
    deployer.deploy(UserManagement);
    deployer.deploy(TransactionPayment);
    deployer.deploy(MovieVoting);
};