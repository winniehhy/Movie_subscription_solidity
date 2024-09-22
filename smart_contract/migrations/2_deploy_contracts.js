const UserManager = artifacts.require("UserManager");
const TransactionPayment = artifacts.require("TransactionPayment");
const MovieVoting = artifacts.require("MovieVoting");

module.exports = function(deployer) {
    deployer.deploy(UserManager);
    deployer.deploy(TransactionPayment);
    deployer.deploy(MovieVoting);
};