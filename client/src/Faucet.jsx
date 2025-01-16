import React, { useState } from "react";
import { Droplets } from "lucide-react";
import { contractService } from "./contractService";

const tokens = [
  {
    name: "BNB",
    logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
    amount: "0.1",
    timeLimit: "24 hours",
  },
  {
    name: "USDC",
    logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    amount: "100",
    timeLimit: "24 hours",
  },
];

function Faucet({ onSuccess }) {
  const [requestingToken, setRequestingToken] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRequest = async (tokenName) => {
    setRequestingToken(tokenName);
    setError(null);
    setSuccess(null);

    try {
      if (tokenName === "BNB") {
        await contractService.claimBNBFaucet();
        setSuccess(`Successfully claimed ${tokens[0].amount} BNB!`);
      } else if (tokenName === "USDC") {
        await contractService.claimUSDCFaucet();
        setSuccess(`Successfully claimed ${tokens[1].amount} USDC!`);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Failed to request tokens");
    } finally {
      setRequestingToken(null);
    }
  };

  const handleRequestAll = async () => {
    setRequestingToken("all");
    setError(null);
    setSuccess(null);

    try {
      await contractService.claimAllFaucets();
      setSuccess("Successfully claimed both BNB and USDC!");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Failed to request tokens");
    } finally {
      setRequestingToken(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent mb-3">
          Testnet Faucet
        </h2>
        <p className="text-indigo-200">Request testnet tokens for development</p>
      </div>

      {error && (
        <div className="glass-dark border-red-500/20 text-red-200 px-6 py-4 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="glass-dark border-green-500/20 text-emerald-200 px-6 py-4 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
            <p>{success}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {tokens.map((token) => (
          <div key={token.name} className="glass rounded-2xl p-6 transition-all duration-200 hover:bg-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="glass-dark p-2 rounded-xl">
                  <img src={token.logo} alt={token.name} className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{token.name}</h3>
                  <p className="text-indigo-200 text-sm">
                    {token.amount} {token.name} per {token.timeLimit}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRequest(token.name)}
                disabled={requestingToken !== null}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all duration-200 ${
                  requestingToken !== null
                    ? "glass-dark text-indigo-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transform hover:scale-[1.02] glow"
                }`}
              >
                <Droplets size={18} />
                <span className="font-medium">
                  {requestingToken === token.name ? "Requesting..." : "Request"}
                </span>
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={handleRequestAll}
          disabled={requestingToken !== null}
          className={`w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
            requestingToken !== null
              ? "glass-dark text-indigo-300 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transform hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/25 glow"
          }`}
        >
          <Droplets size={18} />
          <span>
            {requestingToken === "all" ? "Requesting All..." : "Request All Tokens"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default Faucet;