
const UserManager = artifacts.require("UserManager");

module.exports = function (deployer) {
    deployer.deploy(UserManager);
};

const TransactionPayment = artifacts.require("TransactionPayment");

module.exports = function(deployer) {
  deployer.deploy(TransactionPayment);
};