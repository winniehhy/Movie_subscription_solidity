const TimeLock = artifacts.require("TimeLock");

module.exports = function (deployer) {
  deployer.deploy(TimeLock);
};

const UserManager = artifacts.require("UserManager");

module.exports = function (deployer) {
    deployer.deploy(UserManager);
};