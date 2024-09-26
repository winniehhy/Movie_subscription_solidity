const UserManagement = artifacts.require("UserManagement");
const TransactionPayment = artifacts.require("TransactionPayment");
const MovieVoting = artifacts.require("MovieVoting");
const NotificationManagement = artifacts.require("NotificationManagement");

module.exports = async function(deployer) {
    // Deploy the UserManagement contract
    await deployer.deploy(UserManagement);
    const userManageInstance = await UserManagement.deployed();

    // Deploy other contracts
    await deployer.deploy(TransactionPayment,userManageInstance.address);
    await deployer.deploy(NotificationManagement);

    // Pass the UserManagement contract's address to the MovieVoting constructor
    await deployer.deploy(MovieVoting);
};
