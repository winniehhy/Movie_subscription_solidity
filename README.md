# Decentralized Movie Subscription System

This project is a decentralized movie subscription system built on the Ethereum solidity blockchain. Users can subscribe to different movie plans (monthly, yearly, or custom) and manage their subscriptions through a smart contract. The frontend is built using modern web technologies to interact with the smart contract.

## Prerequisites

Before begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine. You can download them from [Node.js official website](https://nodejs.org/).
- MetaMask extension installed in your browser for interacting with the Ethereum blockchain.
- An Ethereum development environment " Ganache " for local blockchain development.

## How to Run the Program

Follow these steps to set up and run the project:

1. **Clone the repository**:
    ```sh
    git clone https://github.com/yourusername/your-repo-name.git
    cd your-repo-name
    ```

2. **Navigate to the frontend directory**:
    ```sh
    cd frontend
    ```

3. **Install the dependencies**:
    ```sh
    npm install
    ```

4. **Run the development server**:
    ```sh
    npm run dev
    ```

5. **Open your browser and navigate to**:
    ```
    http://localhost:5173/
    ```

## Project Structure

- **smart_contract**: Contains the Solidity smart contract code for managing subscriptions.
- **frontend**: Contains the frontend code built with modern web technologies to interact with the smart contract.

## Smart Contract

The smart contract is written in Solidity and deployed on the Ethereum blockchain. It handles the following functionalities:

- Queueing a subscription
- Cancelling a subscription and refund back the money
- Executing a subscription
- Checking the status of a subscription

## Frontend

using react.js to interacts with the smart contract
