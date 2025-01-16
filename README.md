# Decentralized Application (dApp) for Token Liquidity Management

## Project Overview
This decentralized application (dApp) enables users to manage a liquidity pool with two ERC20 tokens. It provides functionalities for adding liquidity, removing liquidity, and swapping tokens. This project showcases blockchain development, smart contract programming, and full-stack integration.

---

## Features Implemented

- **ERC20 Token Deployment**: Two ERC20 tokens, BNB and USDC, are deployed on the Sepolia test network.
- **Liquidity Pool Smart Contract**: A Uniswap V2-style liquidity pool smart contract allows token swapping and liquidity management.
- **Frontend Interface**: A user-friendly frontend application built with JavaScript and ethers.js for seamless interaction with smart contracts.

---

## Tech Stack
The project uses the following technologies:

1. **React.js**  
   - Framework for building the frontend UI. It allows dynamic user interactions with blockchain data and contract functions.

2. **Ethers.js**  
   - JavaScript library for interacting with Ethereum smart contracts. It simplifies wallet connections, contract interactions, and token balances retrieval.

3. **Hardhat**  
   - A development environment to compile, test, and deploy the smart contracts. It supports Ethereum-based blockchains and includes advanced debugging tools.

4. **AWS**  
   - The application is deployed using AWS for scalable, reliable, and globally distributed hosting.

5. **Tailwind CSS**  
   - Utility-first CSS framework for designing responsive and modern user interfaces with minimal code.
---

Here’s a more detailed explanation of the **Smart Contract Architecture** for the decentralized liquidity pool dApp:

---

### Smart Contract Architecture

The dApp consists of two main types of smart contracts: **ERC20 Token Contracts** and a **Liquidity Pool Contract**.

#### **1. ERC20 Token Contracts**
The project deploys two custom ERC20 tokens (e.g., BNB and USDC equivalents) on an EVM-compatible blockchain.

##### **Key Features**
- **Standard ERC20 Implementation**: Based on the OpenZeppelin library for security and standardization.
- **Minting and Faucet Functionality**: Allows the contract owner or a specific faucet contract to mint tokens for testing purposes.
- **Approval and Allowance Management**: Users must approve the liquidity pool contract to manage their tokens on their behalf.

##### **Functions**
- `mint(address to, uint256 amount)`: Mints a specified amount of tokens to the given address.
- `balanceOf(address account)`: Returns the token balance of a given address.
- `approve(address spender, uint256 amount)`: Approves another contract to spend tokens on behalf of the user.
- `allowance(address owner, address spender)`: Checks the amount of tokens approved but not yet spent.

---

#### **2. Liquidity Pool Smart Contract**
The liquidity pool contract allows users to deposit the two ERC20 tokens, enabling token swaps and liquidity management.

##### **Key Features**
- **Add Liquidity**: Users deposit both tokens in a fixed ratio to the pool.
- **Remove Liquidity**: Users can withdraw their proportional share of the pool, including any fees accrued.
- **Token Swapping**: Implements a swap mechanism using a basic x*y=k automated market maker (AMM) model.

##### **Key Components**
- **Liquidity Pool Reserves**: Stores the balance of each token held in the pool.
- **Price Calculation**: Uses the AMM formula to calculate output amounts and slippage.
- **Fee Mechanism**: A small fee is taken from each trade to incentivize liquidity providers.
- **Slippage Protection**: Users can set a minimum acceptable amount to receive during swaps.

##### **Functions**
1. **Add Liquidity**
   ```solidity
   function addLiquidity(uint256 amountA, uint256 amountB) external;
   ```
   - **Inputs**: Amounts of Token A and Token B.
   - **Logic**: Updates the reserves and mints liquidity tokens representing the user's share.

2. **Remove Liquidity**
   ```solidity
   function removeLiquidity(uint256 liquidity) external;
   ```
   - **Inputs**: The amount of liquidity tokens to redeem.
   - **Logic**: Burns liquidity tokens and transfers proportional reserves back to the user.

3. **Token Swap**
   ```solidity
   function swap(uint256 amountIn, address tokenIn, uint256 minAmountOut) external;
   ```
   - **Inputs**: The amount of input tokens, token type (BNB or USDC), and the minimum amount expected.
   - **Logic**: Uses reserves and swap formula to compute output, ensuring it meets the minimum required.

4. **Get Amount Out**
   ```solidity
   function getAmountOut(uint256 amountIn, address tokenIn) external view returns (uint256);
   ```
   - **Logic**: Calculates how much of the other token a user would receive for a given input.

##### **Mathematical Formula**
The contract follows the **constant product formula** for AMM:
\[
x \times y = k
\]
Where:
- `x` = reserve of Token A
- `y` = reserve of Token B
- `k` = a constant value representing liquidity pool balance

##### **Additional Considerations**
- **Security**: Reentrancy guards prevent double-spend exploits.
- **Gas Optimization**: Efficient storage and calculation methods reduce gas costs.

---


### Prerequisites
- Node.js installed
- MetaMask extension configured for the Sepolia test network

### Installation

1. Clone the repository:
   ```sh
   git@github.com:Srutip04/stunning-rotary-phone.git
   cd stunning-rotary-phone
   ```

2. Install dependencies:
   ```sh
   cd client
   npm install
   ```

3. Start the frontend application:
   ```sh
   npm start
   ```

---

## Usage

### Connecting Wallet
- Ensure MetaMask is connected to the Sepolia test network.
- Click "Connect Wallet" to establish a connection.

### Token Faucets
- Use the faucet functions to mint BNB and USDC tokens.

### Adding Liquidity
- Enter amounts for BNB and USDC.
- Click "Add Liquidity" to deposit tokens into the pool.

### Removing Liquidity
- Click "Remove Liquidity" to withdraw your tokens.

### Swapping Tokens
- Choose BNB or USDC, specify an amount, and execute the swap.

---

## Assumptions and Design Decisions
- The smart contract uses a simple AMM formula for token swaps.
- Both tokens use 18 decimals for uniformity.
- The project is designed for demonstration and learning purposes.

---

## Additional Notes
- Ensure test tokens are available in your wallet for interaction.
- The contract addresses and frontend configuration are specific to the Sepolia test network.

---
