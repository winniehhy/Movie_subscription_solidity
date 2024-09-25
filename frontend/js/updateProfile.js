import contractData from '../../smart_contract/build/contracts/UserManagement.json';

const contractAddress = contractData.networks[5777]?.address;  // smart contract address
const abi = contractData.abi;
let web3;
let userManager;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    userManager = new web3.eth.Contract(abi, contractAddress);

    document.getElementById("connectMetaMask").disabled = false;

    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      alert("MetaMask not connected. Please connect to MetaMask.");
    }
  } else {
    alert("MetaMask is not installed. Please install MetaMask and try again.");
    document.getElementById("connectMetaMask").disabled = true;
  }
});

document.getElementById("connectMetaMask").addEventListener("click", async () => {
  try {
    await ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    alert("Connected to MetaMask account: " + accounts[0]);
    loadProfile(accounts[0]);
  } catch (error) {
    console.error("Error connecting MetaMask: ", error);
    alert("Failed to connect MetaMask");
  }
});

async function loadProfile(account) {
  try {
    const isRegistered = await userManager.methods.isUserRegistered(account).call();
    if (isRegistered) {
      const profile = await userManager.methods.getProfile().call({ from: account });

      document.getElementById("currentUsername").innerText = profile[0];
      document.getElementById("currentEmail").innerText = profile[1];

      const nextUpdateTime = parseInt(profile[4]);
      if (nextUpdateTime > 0) {
        document.getElementById("nextUpdateTime").innerText = new Date(nextUpdateTime * 1000).toLocaleString();
      } else {
        document.getElementById("nextUpdateTime").innerText = "Not yet updated";
      }
    } else {
      throw new Error("User not registered");
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    alert("You are not registered. Please register before accessing this page.");
    window.location.href = "register.html"; // Redirect to the registration page
  }
}

document.getElementById("showProfileModal").addEventListener("click", async () => {
  const accounts = await web3.eth.getAccounts();
  if (accounts.length > 0) {
    loadProfile(accounts[0]);
    document.getElementById("currentProfileModal").style.display = "block";
  } else {
    alert("Please connect MetaMask first.");
  }
});

document.getElementById("closeCurrentModal").addEventListener("click", () => {
  document.getElementById("currentProfileModal").style.display = "none";
});

document.getElementById("closeModifiedModal").addEventListener("click", () => {
  document.getElementById("modifiedProfileModal").style.display = "none";
});

document.getElementById("updateProfileForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent form submission
  const accounts = await web3.eth.getAccounts(); // Get MetaMask accounts

  if (accounts.length === 0) {
    alert("Please connect MetaMask first.");
    return;
  }

  const account = accounts[0];
  const newUsername = document.getElementById("username").value;
  const newEmail = document.getElementById("email").value;

  try {
    // Get current profile
    const profile = await userManager.methods.getProfile().call({ from: account });
    const nextUpdateTime = parseInt(profile[4]); // Next allowed update time
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    // Allow profile update if the next allowed time has passed
    if (nextUpdateTime === 0 || currentTime >= nextUpdateTime) {
      // Show confirmation modal before updating
      document.getElementById("modifiedProfileModal").style.display = "block";
      document.getElementById("modifiedUsername").textContent = newUsername;
      document.getElementById("modifiedEmail").textContent = newEmail;

      document.getElementById("confirmUpdate").onclick = async () => {
        try {
          // Perform the update on the blockchain
          await userManager.methods.updateProfile(newUsername, newEmail).send({ from: account });
          alert("Profile updated successfully.");
          window.location.href = "userProfile.html"; // Redirect after registration
          document.getElementById("modifiedProfileModal").style.display = "none";
          loadProfile(account); // Refresh the profile after update
        } catch (error) {
          console.error("Error updating profile:", error);
          alert("Profile update failed.");
        }
      };
    } else {
      const nextUpdateDate = new Date(nextUpdateTime * 1000).toLocaleString();
      alert("You cannot update your profile until: " + nextUpdateDate);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Error loading profile data.");
  }
});
