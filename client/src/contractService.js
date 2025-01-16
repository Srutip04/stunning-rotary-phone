import { ethers } from "ethers";
import UniswapV2Pool from "./contracts/Liquidity.json";


const POOL_ADDRESS = "0xF6166E528078d659f13C0e7C5C81118ef8754d68";
const BNB_ADDRESS = "0xE46c46a057CdFda1D0c3A66E4B6849ee4B1682B8";
const USDC_ADDRESS = "0x851D9fd3a459db40F04EFe54A85c99CA7C55c88A";

const BNB_FAUCET_AMOUNT = ethers.utils.parseEther("0.1");
const USDC_FAUCET_AMOUNT = ethers.utils.parseEther("100");

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
  "function mint(address to, uint256 amount) external",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

export class ContractService {
  provider = null;
  signer = null;
  poolContract = null;
  bnbContract = null;
  usdcContract = null;

  async connectWallet() {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    await this.provider.send("eth_requestAccounts", []);

    const network = await this.provider.getNetwork();

    if (network.chainId !== 11155111) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
      } catch (error) {
        throw new Error("Please switch to Sepolia network in MetaMask");
      }
    }

    this.signer = this.provider.getSigner();

    this.poolContract = new ethers.Contract(POOL_ADDRESS, UniswapV2Pool, this.signer);
    this.bnbContract = new ethers.Contract(BNB_ADDRESS, ERC20_ABI, this.signer);
    this.usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, this.signer);

    const address = await this.signer.getAddress();
    return address;
  }

  async getBalances(address) {
    if (!this.bnbContract || !this.usdcContract) throw new Error("Contracts not initialized");

    const bnbBalance = await this.bnbContract.balanceOf(address);
    const usdcBalance = await this.usdcContract.balanceOf(address);

    return {
      bnb: ethers.utils.formatEther(bnbBalance),
      usdc: ethers.utils.formatEther(usdcBalance),
    };
  }

  async claimBNBFaucet() {
    if (!this.bnbContract || !this.signer) throw new Error("BNB contract not initialized");

    const address = await this.signer.getAddress();
    const tx = await this.bnbContract.mint(address, BNB_FAUCET_AMOUNT);
    return tx.wait();
  }

  async claimUSDCFaucet() {
    if (!this.usdcContract || !this.signer) throw new Error("USDC contract not initialized");

    const address = await this.signer.getAddress();
    const tx = await this.usdcContract.mint(address, USDC_FAUCET_AMOUNT);
    return tx.wait();
  }

  async claimAllFaucets() {
    if (!this.signer) throw new Error("Wallet not connected");

    try {
      await Promise.all([this.claimBNBFaucet(), this.claimUSDCFaucet()]);

      const address = await this.signer.getAddress();
      return await this.getBalances(address);
    } catch (error) {
      throw new Error(`Failed to claim tokens: ${error.message}`);
    }
  }

  async approveToken(token, amount) {
    const contract = token === "BNB" ? this.bnbContract : this.usdcContract;
    if (!contract || !this.signer) throw new Error("Contract not initialized");

    const address = await this.signer.getAddress();
    const allowance = await contract.allowance(address, POOL_ADDRESS);

    if (allowance.lt(amount)) {
      const tx = await contract.approve(POOL_ADDRESS, amount);
      await tx.wait();
    }
  }

  async swap(amountIn, tokenIn, minAmountOut) {
    if (!this.poolContract || !this.signer) throw new Error("Contract not initialized");

    const amountInWei = ethers.utils.parseEther(amountIn);
    const minAmountOutWei = ethers.utils.parseEther(minAmountOut);

    await this.approveToken(tokenIn, amountInWei);

    const tx = await this.poolContract.swap(
      amountInWei,
      tokenIn === "BNB" ? BNB_ADDRESS : USDC_ADDRESS,
      minAmountOutWei,
      await this.signer.getAddress()
    );

    return tx.wait();
  }

  async addLiquidity(bnbAmount, usdcAmount) {
    if (!this.poolContract || !this.signer) throw new Error("Contract not initialized");

    const bnbAmountWei = ethers.utils.parseEther(bnbAmount);
    const usdcAmountWei = ethers.utils.parseEther(usdcAmount);

    await this.approveToken("BNB", bnbAmountWei);
    await this.approveToken("USDC", usdcAmountWei);

    const tx = await this.poolContract.mint(
      bnbAmountWei,
      usdcAmountWei,
      await this.signer.getAddress()
    );

    return tx.wait();
  }

  async getAmountOut(amountIn, tokenIn) {
    if (!this.poolContract) throw new Error("Contract not initialized");

    const amountInWei = ethers.utils.parseEther(amountIn);

    const amountOutWei = await this.poolContract.getAmountOut(
      amountInWei,
      tokenIn === "BNB" ? BNB_ADDRESS : USDC_ADDRESS
    );

    return ethers.utils.formatEther(amountOutWei);
  }
}

export const contractService = new ContractService();
