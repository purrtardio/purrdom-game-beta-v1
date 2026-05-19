import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  walletConnectWallet
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { mock } from "wagmi/connectors";

export const HYPEREVM_CHAIN_ID = 999;
export const HYPEREVM_RPC_URL = "https://rpc.hyperliquid.xyz/evm";

export const hyperEvm = {
  id: HYPEREVM_CHAIN_ID,
  name: "Hyperliquid",
  nativeCurrency: {
    decimals: 18,
    name: "HYPE",
    symbol: "HYPE"
  },
  rpcUrls: {
    default: { http: [HYPEREVM_RPC_URL] },
    public: { http: [HYPEREVM_RPC_URL] }
  },
  blockExplorers: {
    default: {
      name: "HyperEVM Scan",
      url: "https://hyperevmscan.io"
    }
  }
};

export const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";
const appName = "Purrdom";
const rainbowWallets = walletConnectProjectId
  ? [rainbowWallet, rabbyWallet, injectedWallet, walletConnectWallet, metaMaskWallet, coinbaseWallet]
  : [rabbyWallet, injectedWallet, metaMaskWallet, coinbaseWallet];

const connectors = connectorsForWallets(
  [
    {
      groupName: walletConnectProjectId ? "Recommended" : "Installed wallets",
      wallets: rainbowWallets
    }
  ],
  {
    appName,
    projectId: walletConnectProjectId || "purrdom-dev-no-walletconnect"
  }
);

if (import.meta.env.DEV) {
  connectors.push(
    mock({
      accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
      features: {
        signMessage: true,
        switchChain: true
      }
    })
  );
}

export const wagmiConfig = createConfig({
  chains: [hyperEvm],
  connectors,
  transports: {
    [hyperEvm.id]: http(HYPEREVM_RPC_URL)
  }
});
