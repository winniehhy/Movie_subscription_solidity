const UserManagement = artifacts.require("UserManagement");
const TransactionPayment = artifacts.require("TransactionPayment");
const MovieVoting = artifacts.require("MovieVoting");
const NotificationManagement = artifacts.require("NotificationManagement");
const ContentManagement = artifacts.require("ContentManagement");

module.exports = async function(deployer) {
    // Deploy the UserManagement contract
    await deployer.deploy(UserManagement);
    const userManageInstance = await UserManagement.deployed();
    await deployer.deploy(TransactionPayment,  userManageInstance.address);
    const TransactionPaymentInstance = await TransactionPayment.deployed();

    // Deploy other contracts
    await deployer.deploy(NotificationManagement);
    await deployer.deploy(ContentManagement,userManageInstance.address);

    // Pass the UserManagement contract's address to the MovieVoting constructor
    await deployer.deploy(MovieVoting,TransactionPaymentInstance.address);
};
