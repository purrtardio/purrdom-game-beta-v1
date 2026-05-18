import "@rainbow-me/rainbowkit/styles.css";
import "../../styles/main.css";
import "./onboarding.css";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { App } from "./App.jsx";
import { wagmiConfig } from "./wagmiConfig.js";

const queryClient = new QueryClient();

createRoot(document.getElementById("react-root")).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider
        modalSize="compact"
        theme={darkTheme({
          accentColor: "#48e5df",
          accentColorForeground: "#08111f",
          borderRadius: "small",
          fontStack: "system"
        })}
      >
        <App />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
