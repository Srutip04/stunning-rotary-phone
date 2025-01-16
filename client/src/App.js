import React, { useState, useEffect } from "react";
import { ArrowDownUp, Plus, Wallet } from "lucide-react";
import Faucet from "./Faucet";
import { contractService } from "./contractService";

function App() {
  const [mode, setMode] = useState("trade");
  const [token1Amount, setToken1Amount] = useState("");
  const [token2Amount, setToken2Amount] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [balances, setBalances] = useState({ bnb: "0.0", usdc: "0.0" });
  const [isLoading, setIsLoading] = useState(false);

  const [token1, setToken1] = useState({
    symbol: "BNB",
    logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
  });
  const [token2, setToken2] = useState({
    symbol: "USDC",
    logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  });

  useEffect(() => {
    setToken1Amount("");
    setToken2Amount("");
  }, [mode]);

  useEffect(() => {
    if (isWalletConnected && account) {
      updateBalances();
    }
  }, [isWalletConnected, account]);

  const updateBalances = async () => {
    try {
      const newBalances = await contractService.getBalances(account);
      setBalances(newBalances);
    } catch (error) {
      console.error("Failed to update balances:", error);
    }
  };

  const calculatePrice = async (value, isToken1) => {
    if (!value || isNaN(Number(value))) {
      setToken1Amount("");
      setToken2Amount("");
      return;
    }

    setIsCalculating(true);
    try {
      if (isToken1) {
        const amountOut = await contractService.getAmountOut(value, token1.symbol);
        setToken2Amount(amountOut);
        setToken1Amount(value);
      } else {
        const amountOut = await contractService.getAmountOut(value, token2.symbol);
        setToken1Amount(amountOut);
        setToken2Amount(value);
      }
    } catch (error) {
      console.error("Error calculating price:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleToken1Change = (value) => {
    setToken1Amount(value);
    calculatePrice(value, true);
  };

  const handleToken2Change = (value) => {
    setToken2Amount(value);
    calculatePrice(value, false);
  };

  const handleSwapTokens = () => {
    if (mode === "trade") {
      const tempToken = token1;
      setToken1(token2);
      setToken2(tempToken);
      setToken1Amount(token2Amount);
      setToken2Amount(token1Amount);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const address = await contractService.connectWallet();
      setAccount(address);
      setIsWalletConnected(true);

      const balances = await contractService.getBalances(address);
      setBalances(balances);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleSwap = async () => {
    if (!isWalletConnected || !token1Amount || !token2Amount) return;

    setIsLoading(true);
    try {
      await contractService.swap(token1Amount, token1.symbol, token2Amount);
      await updateBalances();
      setToken1Amount("");
      setToken2Amount("");
    } catch (error) {
      console.error("Swap failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!isWalletConnected || !token1Amount || !token2Amount) return;

    setIsLoading(true);
    try {
      const [bnbAmount, usdcAmount] =
        token1.symbol === "BNB" ? [token1Amount, token2Amount] : [token2Amount, token1Amount];

      await contractService.addLiquidity(bnbAmount, usdcAmount);
      await updateBalances();
      setToken1Amount("");
      setToken2Amount("");
    } catch (error) {
      console.error("Failed to add liquidity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMainContent = () => {
    if (mode === "faucet") {
      return <Faucet onSuccess={updateBalances} />;
    }

    return (
      <div className="space-y-6">
        {/* First Token Input */}
        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between mb-4">
            <label className="text-indigo-100 text-sm font-medium">
              {mode === "trade" ? "You pay" : "Token 1"}
            </label>
            <span className="text-indigo-200 text-sm">
              Balance: {token1.symbol === "BNB" ? balances.bnb : balances.usdc}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              className="token-input text-2xl text-white rounded-xl px-4 py-3 w-2/3"
              placeholder="0.0"
              value={token1Amount}
              onChange={(e) => handleToken1Change(e.target.value)}
              disabled={!isWalletConnected || isLoading}
            />
            <div className="flex items-center glass-dark rounded-xl px-4 py-2.5">
              <img
                src={token1.logo}
                alt={token1.symbol}
                className="w-6 h-6 mr-2"
              />
              <span className="text-white font-medium">{token1.symbol}</span>
            </div>
          </div>
        </div>

        {/* Middle Button */}
        {mode === "trade" ? (
          <div className="flex justify-center -my-3 z-10">
            <button
              onClick={handleSwapTokens}
              className="glass-dark p-3 rounded-xl hover:bg-indigo-600/20 text-indigo-100 transition-all duration-200 transform hover:scale-105 glow"
              disabled={isLoading}
            >
              <ArrowDownUp size={20} />
            </button>
          </div>
        ) : (
          <div className="flex justify-center -my-3 z-10">
            <div className="glass-dark p-3 rounded-xl text-indigo-100">
              <Plus size={20} />
            </div>
          </div>
        )}

        {/* Second Token Input */}
        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between mb-4">
            <label className="text-indigo-100 text-sm font-medium">
              {mode === "trade" ? "You receive" : "Token 2"}
            </label>
            <div className="flex items-center space-x-3">
              <span className="text-indigo-200 text-sm">
                Balance: {token2.symbol === "BNB" ? balances.bnb : balances.usdc}
              </span>
              {mode === "trade" && token2Amount && (
                <span className="text-xs px-3 py-1 rounded-full glass-dark">
                  {isCalculating ? "Calculating..." : "Estimated"}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              className={`token-input text-2xl rounded-xl px-4 py-3 w-2/3 transition-all duration-200 ${
                isCalculating ? "text-white/50" : "text-white"
              }`}
              placeholder="0.0"
              value={token2Amount}
              onChange={(e) => handleToken2Change(e.target.value)}
              disabled={!isWalletConnected || isLoading}
            />
            <div className="flex items-center glass-dark rounded-xl px-4 py-2.5">
              <img
                src={token2.logo}
                alt={token2.symbol}
                className="w-6 h-6 mr-2"
              />
              <span className="text-white font-medium">{token2.symbol}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-indigo-500/25 glow"
          onClick={mode === "trade" ? handleSwap : handleAddLiquidity}
          disabled={
            !isWalletConnected || isLoading || !token1Amount || !token2Amount
          }
        >
          {isLoading
            ? "Loading..."
            : mode === "trade"
            ? "Swap Tokens"
            : "Add Liquidity"}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-3">
            <button
              className={`px-5 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                mode === "trade"
                  ? "glass-dark text-white shadow-lg glow"
                  : "text-indigo-200 hover:text-white"
              }`}
              onClick={() => setMode("trade")}
            >
              Trade
            </button>
            <button
              className={`px-5 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                mode === "liquidity"
                  ? "glass-dark text-white shadow-lg glow"
                  : "text-indigo-200 hover:text-white"
              }`}
              onClick={() => {
                setMode("liquidity");
                setToken1({
                  symbol: "BNB",
                  logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
                });
                setToken2({
                  symbol: "USDC",
                  logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
                });
              }}
            >
              Liquidity
            </button>
            <button
              className={`px-5 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                mode === "faucet"
                  ? "glass-dark text-white shadow-lg glow"
                  : "text-indigo-200 hover:text-white"
              }`}
              onClick={() => setMode("faucet")}
            >
              Faucet
            </button>
          </div>
          <button
            onClick={handleConnectWallet}
            className="flex items-center space-x-2 glass-dark px-5 py-2.5 rounded-xl text-white transition-all duration-200 hover:bg-indigo-600/20 transform hover:scale-[1.02] glow"
          >
            <Wallet size={18} />
            <span className="font-medium">
              {isWalletConnected
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : "Connect Wallet"}
            </span>
          </button>
        </div>

        {/* Main Card */}
        <div className="glass rounded-3xl p-8 shadow-xl">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
