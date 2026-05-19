import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rabbyWallet,
  walletConnectWallet
} from "@rainbow-me/rainbowkit/wallets";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useSwitchChain
} from "wagmi";
import { bootstrapLegacyGame } from "../legacy/bootstrapLegacyGame.js";
import { HYPEREVM_CHAIN_ID, walletConnectProjectId } from "./wagmiConfig.js";

const STORAGE_KEY = "purrdom:onboarding:v1";
const PROFILE_VERSION = 1;
const ONBOARDING_ASSET_BASE = "/assets/onboarding";
const PASSPORT_CAT_SRC = `${ONBOARDING_ASSET_BASE}/passport-cat.png`;
const PROGRESS_CAT_SRC = `${ONBOARDING_ASSET_BASE}/progress-cat.png`;
const WALLET_POUCH_SRC = `${ONBOARDING_ASSET_BASE}/wallet-pouch.svg`;
const NETWORK_BADGE_SRC = `${ONBOARDING_ASSET_BASE}/network-badge.svg`;
const SIGN_QUILL_SRC = `${ONBOARDING_ASSET_BASE}/sign-quill.svg`;
const PASSPORT_BADGE_SRC = `${ONBOARDING_ASSET_BASE}/passport-badge.svg`;
const STAMP_PAW_SRC = `${ONBOARDING_ASSET_BASE}/stamp-paw.svg`;
const READY_SEAL_SRC = `${ONBOARDING_ASSET_BASE}/ready-seal.svg`;
const NETWORK_SCENE_SRC = `${ONBOARDING_ASSET_BASE}/network-scene.png`;
const SIGN_DESK_SRC = `${ONBOARDING_ASSET_BASE}/sign-desk.png`;
const FALLBACK_WALLET_CONNECT_PROJECT_ID = "purrdom-dev-no-walletconnect";

async function getWalletIcon(wallet) {
  return typeof wallet.iconUrl === "function" ? wallet.iconUrl() : wallet.iconUrl;
}

async function getRainbowKitWalletIcons() {
  const projectId = walletConnectProjectId || FALLBACK_WALLET_CONNECT_PROJECT_ID;
  const wallets = {
    rabby: rabbyWallet(),
    metamask: metaMaskWallet({ projectId }),
    coinbase: coinbaseWallet({ appName: "Purrdom" }),
    walletconnect: walletConnectWallet({ projectId })
  };

  const entries = await Promise.all(
    Object.entries(wallets).map(async ([key, wallet]) => [
      key,
      {
        iconBackground: wallet.iconBackground,
        iconUrl: await getWalletIcon(wallet)
      }
    ])
  );

  return Object.fromEntries(entries);
}

function readProfile() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function saveProfile(profile) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function clearProfile() {
  window.localStorage.removeItem(STORAGE_KEY);
}

function shortAddress(address) {
  if (!address || address.length < 12) return address || "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function profileMessage(address) {
  return [
    "Purrdom Passport",
    "",
    "Sign this gasless message to link your wallet to your local Purrdom profile.",
    "No transaction, token transfer, or gas fee is requested.",
    "",
    `Address: ${address}`,
    `Issued At: ${new Date().toISOString()}`
  ].join("\n");
}

function localDevSignature(message, address) {
  const bytes = new TextEncoder().encode(`${address}:${message}`);
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `0x${hex.slice(0, 130).padEnd(130, "0")}`;
}

function bridgeWalletToGame(game, wallet) {
  if (!game || !game.state) return;
  game.state.wallet = wallet;
  if (game.hud) game.hud.render();
  if (game.eventBus) {
    game.eventBus.emit("wallet:changed", Object.assign({}, wallet));
  }
}

export function App() {
  const [game, setGame] = useState(null);
  const [profile, setProfile] = useState(() => readProfile());
  const [onboardingOpen, setOnboardingOpen] = useState(true);
  const [walletError, setWalletError] = useState("");

  const { address, chain, connector, isConnected } = useAccount();
  const { isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { openAccountModal } = useAccountModal();
  const { openConnectModal } = useConnectModal();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();

  useEffect(() => {
    bootstrapLegacyGame().then(setGame).catch((error) => setWalletError(error.message));
  }, []);

  useEffect(() => {
    if (!profile || profile.mode !== "wallet" || !isConnected || !address) return;
    if (profile.address && profile.address.toLowerCase() === address.toLowerCase()) return;
    clearProfile();
    setProfile(null);
    setOnboardingOpen(true);
  }, [address, isConnected, profile]);

  const walletState = useMemo(() => {
    const activeChainId = chain?.id || profile?.chainId || null;
    return {
      mode: profile?.mode || "none",
      available: true,
      connected: Boolean(isConnected && address),
      connecting: isConnecting,
      address: address || profile?.address || null,
      chainId: activeChainId,
      chainName: activeChainId === HYPEREVM_CHAIN_ID ? "Hyperliquid" : chain?.name || "",
      providerName: connector?.name || profile?.connectorName || "",
      signed: Boolean(profile?.signature),
      completed: Boolean(profile?.completed),
      guest: profile?.mode === "guest",
      error: walletError
    };
  }, [address, chain, connector, isConnected, isConnecting, profile, walletError]);

  useEffect(() => {
    bridgeWalletToGame(game, walletState);
  }, [game, walletState]);

  const setGuestProfile = () => {
    const nextProfile = {
      version: PROFILE_VERSION,
      mode: "guest",
      completed: true,
      address: null,
      chainId: null,
      connectorName: "Guest",
      signature: null,
      signedMessage: null,
      signedAt: null
    };
    saveProfile(nextProfile);
    setProfile(nextProfile);
    setOnboardingOpen(false);
    setWalletError("");
  };

  const connectWallet = () => {
    setWalletError("");
    if (openConnectModal) {
      openConnectModal();
      return;
    }
    setWalletError("No wallet connector is available in this browser.");
  };

  const switchToHyperEvm = async () => {
    setWalletError("");
    try {
      await switchChainAsync({ chainId: HYPEREVM_CHAIN_ID });
    } catch (error) {
      setWalletError(error.message || "Unable to switch to HyperEVM.");
    }
  };

  const signIn = async () => {
    if (!address) return;
    setWalletError("");
    try {
      const signedMessage = profileMessage(address);
      const signature = connector?.id === "mock"
        ? localDevSignature(signedMessage, address)
        : await signMessageAsync({ message: signedMessage });
      const nextProfile = {
        version: PROFILE_VERSION,
        mode: "wallet",
        completed: true,
        address,
        chainId: chain?.id || HYPEREVM_CHAIN_ID,
        connectorName: connector?.name || "Wallet",
        signature,
        signedMessage,
        signedAt: new Date().toISOString()
      };
      saveProfile(nextProfile);
      setProfile(nextProfile);
    } catch (error) {
      setWalletError(error.message || "Signature request failed.");
    }
  };

  const manageWallet = () => {
    setWalletError("");
    if (openAccountModal) {
      openAccountModal();
      return;
    }
    connectWallet();
  };

  const disconnectWallet = () => {
    disconnect();
    setGuestProfile();
  };

  return (
    <>
      {!onboardingOpen && (
        <WalletStatusDock
          address={address}
          chain={chain}
          connector={connector}
          isConnected={isConnected}
          onConnect={() => setOnboardingOpen(true)}
          onDisconnect={disconnectWallet}
          profile={profile}
        />
      )}
      {onboardingOpen ? (
        <OnboardingPanel
          address={address}
          chain={chain}
          connector={connector}
          isConnected={isConnected}
          isConnecting={isConnecting}
          isSigning={isSigning}
          isSwitching={isSwitching}
          onClose={() => profile?.completed && setOnboardingOpen(false)}
          onConnect={connectWallet}
          onGuest={setGuestProfile}
          onManageWallet={manageWallet}
          onSign={signIn}
          onSwitch={switchToHyperEvm}
          previewStage={import.meta.env.DEV ? new URLSearchParams(window.location.search).get("onboardingStage") : ""}
          profile={profile}
          walletError={walletError}
        />
      ) : null}
    </>
  );
}

function WalletStatusDock({
  address,
  chain,
  connector,
  isConnected,
  onConnect,
  onDisconnect,
  profile
}) {
  const mode = profile?.mode || "none";
  const isWalletProfile = mode === "wallet";
  const isHyperEvm = chain?.id === HYPEREVM_CHAIN_ID || profile?.chainId === HYPEREVM_CHAIN_ID;
  const title = isWalletProfile
    ? shortAddress(address || profile?.address)
    : mode === "guest" ? "Guest Hypurr" : "Start Passport";
  const detail = isWalletProfile
    ? `${connector?.name || profile?.connectorName || "Wallet"} · ${isHyperEvm ? "HyperEVM" : "Wrong network"}`
    : mode === "guest" ? "Default starter profile" : "Wallet or guest";

  return (
    <section className={`wallet-dock ${isWalletProfile ? "wallet-dock-connected" : ""}`}>
      <button className="wallet-dock-main" type="button" onClick={onConnect}>
        <span className="wallet-dock-orb" />
        <span>
          <strong>{title}</strong>
          <small>{detail}</small>
        </span>
      </button>
      {isConnected || isWalletProfile ? (
        <button className="wallet-dock-action" type="button" onClick={onDisconnect}>
          Disconnect
        </button>
      ) : null}
    </section>
  );
}

function OnboardingPanel({
  address,
  chain,
  connector,
  isConnected,
  isConnecting,
  isSigning,
  isSwitching,
  onClose,
  onConnect,
  onGuest,
  onManageWallet,
  onSign,
  onSwitch,
  previewStage,
  profile,
  walletError
}) {
  const preview = useMemo(() => getOnboardingPreview(previewStage), [previewStage]);
  const viewAddress = preview ? preview.address : address;
  const viewChain = preview ? preview.chain : chain;
  const viewConnector = preview ? preview.connector : connector;
  const viewIsConnected = preview ? preview.isConnected : isConnected;
  const viewProfile = preview ? preview.profile : profile;
  const isHyperEvm = viewChain?.id === HYPEREVM_CHAIN_ID;
  const canClose = Boolean(viewProfile?.completed);
  const activeStep = preview?.step || getActiveOnboardingStep({
    isConnected: viewIsConnected,
    isHyperEvm,
    profile: viewProfile
  });

  return (
    <section className="onboarding-shell" aria-label="Purrdom onboarding">
      <article className={`onboarding-panel onboarding-panel-${activeStep}`}>
        <button
          className={`onboarding-close ${canClose ? "" : "is-locked"}`}
          type="button"
          onClick={canClose ? onClose : undefined}
          aria-label={canClose ? "Close" : "Complete onboarding to close"}
          disabled={!canClose}
        >
          x
        </button>

        {activeStep === "provider" ? (
          <ProviderStage
            isConnecting={isConnecting}
            onConnect={onConnect}
            onGuest={onGuest}
          />
        ) : (
          <div className="passport-layout">
            <ProgressAside activeStep={activeStep} />

            <section className="passport-stage" aria-live="polite">
              {activeStep === "network" ? (
                <NetworkStage
                  chain={viewChain}
                  isSwitching={isSwitching}
                  onSwitch={onSwitch}
                />
              ) : null}

              {activeStep === "sign" ? (
                <SignStage
                  address={viewAddress}
                  connector={viewConnector}
                  isSigning={isSigning}
                  onSign={onSign}
                />
              ) : null}

              {activeStep === "ready" ? (
                <ReadyStage
                  address={viewAddress || viewProfile?.address}
                  connector={viewConnector}
                  onClose={onClose}
                  onManageWallet={onManageWallet}
                  profile={viewProfile}
                />
              ) : null}
            </section>
          </div>
        )}

        {walletError ? <p className="onboarding-error">{walletError}</p> : null}
      </article>
    </section>
  );
}

function getActiveOnboardingStep({ isConnected, isHyperEvm, profile }) {
  if (profile?.mode === "wallet" && profile.signature) return "ready";
  if (!isConnected) return "provider";
  if (!isHyperEvm) return "network";
  return "sign";
}

function getOnboardingPreview(stage) {
  if (!stage) return null;

  const demoAddress = "0x1234567890abcdef1234567890abcdef12345678";
  const walletConnector = { name: "Rabby Wallet" };
  const hyperChain = { id: HYPEREVM_CHAIN_ID, name: "Hyperliquid" };

  if (["choice", "guest", "wallet-connect", "wallet-provider", "provider"].includes(stage)) {
    return { step: "provider", isConnected: false, profile: null };
  }

  if (stage === "wallet-network") {
    return {
      step: "network",
      address: demoAddress,
      chain: { id: 1, name: "Ethereum" },
      connector: walletConnector,
      isConnected: true,
      profile: null
    };
  }

  if (stage === "wallet-sign") {
    return {
      step: "sign",
      address: demoAddress,
      chain: hyperChain,
      connector: walletConnector,
      isConnected: true,
      profile: null
    };
  }

  if (stage === "ready") {
    return {
      step: "ready",
      address: demoAddress,
      chain: hyperChain,
      connector: walletConnector,
      isConnected: true,
      profile: {
        mode: "wallet",
        completed: true,
        address: demoAddress,
        chainId: HYPEREVM_CHAIN_ID,
        connectorName: walletConnector.name,
        signature: "0xready"
      }
    };
  }

  return null;
}

function ProgressAside({ activeStep }) {
  return (
    <aside className="passport-aside" aria-label="Passport progress">
      <WalletProgress activeStep={activeStep} />
      <div className="progress-cat-counter" aria-hidden="true">
        <img alt="" src={PROGRESS_CAT_SRC} />
        <span />
      </div>
    </aside>
  );
}

function WalletProgress({ activeStep }) {
  const steps = [
    {
      key: "provider",
      label: "1",
      title: "Connect Wallet",
      body: "Choose a wallet provider."
    },
    {
      key: "network",
      label: "2",
      title: "Verify Network",
      body: "Confirm the game network."
    },
    {
      key: "sign",
      label: "3",
      title: "Sign Message",
      body: "Approve a gasless passport."
    },
    {
      key: "ready",
      label: "4",
      title: "Passport Ready",
      body: "Enter with wallet identity."
    }
  ];
  const activeIndex = steps.findIndex((step) => step.key === activeStep);

  return (
    <section className="wallet-progress" aria-label="Wallet onboarding progress">
      {steps.map((step, index) => (
        <div
          className={`wallet-progress-step ${index === activeIndex ? "is-active" : ""} ${index < activeIndex ? "is-complete" : ""}`}
          key={step.key}
        >
          <span>{index < activeIndex ? "OK" : step.label}</span>
          <div>
            <strong>{step.title}</strong>
            <small>{step.body}</small>
          </div>
        </div>
      ))}
    </section>
  );
}

function ProviderStage({ isConnecting, onConnect, onGuest }) {
  const [walletIcons, setWalletIcons] = useState({});

  useEffect(() => {
    let mounted = true;

    getRainbowKitWalletIcons()
      .then((icons) => {
        if (mounted) setWalletIcons(icons);
      })
      .catch(() => {
        if (mounted) setWalletIcons({});
      });

    return () => {
      mounted = false;
    };
  }, []);

  const walletOptions = useMemo(() => [
    { key: "rabby", label: "Rabby" },
    { key: "metamask", label: "MetaMask" },
    { key: "coinbase", label: "Coinbase" },
    { key: "walletconnect", label: "WalletConnect" }
  ].map((wallet) => ({ ...wallet, ...walletIcons[wallet.key] })), [walletIcons]);

  return (
    <section className="provider-sheet" aria-live="polite">
      <div className="provider-title-row">
        <span className="provider-wallet-icon" aria-hidden="true">
          <img alt="" src={WALLET_POUCH_SRC} />
        </span>
        <div>
          <h1>Choose Wallet</h1>
          <p>Pick a wallet to create your Purrdom Passport.</p>
        </div>
      </div>

      <div className="provider-content">
        <PassportCard />
        <div className="wallet-option-list" aria-label="Wallet providers">
          {walletOptions.map((wallet) => (
            <button
              aria-label={`Connect ${wallet.label}`}
              className="wallet-option"
              disabled={isConnecting}
              key={wallet.key}
              onClick={onConnect}
              type="button"
            >
              <span
                className={`wallet-option-mark wallet-option-${wallet.key}`}
                style={{ "--wallet-icon-bg": wallet.iconBackground || "transparent" }}
                aria-hidden="true"
              >
                {wallet.iconUrl ? <img alt="" src={wallet.iconUrl} /> : null}
              </span>
              <strong>{wallet.label}</strong>
              <small>{isConnecting ? "Connecting" : ">"}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="provider-note">You can connect a different wallet later.</div>

      <div className="provider-footer">
        <button className="purr-link" type="button" onClick={onGuest}>
          Continue as Guest
        </button>
      </div>
    </section>
  );
}

function NetworkStage({ chain, isSwitching, onSwitch }) {
  return (
    <>
      <div className="stage-title-row">
        <span className="stage-icon" aria-hidden="true">
          <img alt="" src={NETWORK_BADGE_SRC} />
        </span>
        <div className="stage-card-header">
          <span>Purrdom runs on HyperEVM</span>
          <strong>Confirm Network</strong>
        </div>
      </div>

      <div className="network-postcard">
        <span>Current network</span>
        <strong>{chain?.name || "Unknown network"}</strong>
        <div className="network-bridge" aria-hidden="true">
          <img alt="" src={NETWORK_SCENE_SRC} />
        </div>
        <button className="purr-primary" type="button" onClick={onSwitch} disabled={isSwitching}>
          {isSwitching ? "Switching" : "Switch to HyperEVM"}
        </button>
      </div>

      <div className="sample-note">Switching networks does not send a transaction.</div>
    </>
  );
}

function SignStage({ address, connector, isSigning, onSign }) {
  return (
    <>
      <div className="stage-title-row">
        <span className="stage-icon" aria-hidden="true">
          <img alt="" src={SIGN_QUILL_SRC} />
        </span>
        <div className="stage-card-header">
          <span>Approve one gasless message</span>
          <strong>Sign Passport</strong>
        </div>
      </div>

      <div className="wallet-receipt">
        <span>{connector?.name || "Connected Wallet"}</span>
        <strong>{shortAddress(address)}</strong>
      </div>

      <div className="signature-grid">
        <div className="signature-callout">
          <strong>This is not a transaction</strong>
          <p>Your wallet signs a message so Purrdom can attach this wallet to your local profile.</p>
        </div>
        <TrustList items={["No gas", "No token transfer", "Local profile link"]} />
      </div>

      <div className="signature-desk" aria-hidden="true">
        <img alt="" src={SIGN_DESK_SRC} />
      </div>

      <div className="onboarding-actions">
        <button className="purr-primary" type="button" onClick={onSign} disabled={isSigning}>
          {isSigning ? "Waiting for Signature" : "Sign Passport"}
        </button>
      </div>
      <div className="sample-note">This links your wallet to a local Purrdom profile.</div>
    </>
  );
}

function ReadyStage({ address, connector, onClose, onManageWallet, profile }) {
  return (
    <>
      <div className="stage-title-row">
        <span className="stage-icon" aria-hidden="true">
          <img alt="" src={PASSPORT_BADGE_SRC} />
        </span>
        <div className="stage-card-header">
          <span>Your wallet is linked to this Purrdom profile</span>
          <strong>Passport Ready</strong>
        </div>
      </div>

      <div className="ready-passport">
        <div className="ready-cat">
          <img alt="" src={PROGRESS_CAT_SRC} />
        </div>
        <div className="ready-card-copy">
          <span>Purrdom Passport</span>
          <div className="ready-id-row">
            <img alt="" src={PASSPORT_CAT_SRC} />
            <div>
              <small>Citizen ID</small>
              <strong>{shortAddress(address)}</strong>
              <small>{connector?.name || profile?.connectorName || "Wallet"} / HyperEVM</small>
            </div>
          </div>
        </div>
        <img className="ready-seal" alt="" src={READY_SEAL_SRC} />
      </div>

      <div className="ready-assignment">Starter Hypurr assigned</div>

      <div className="onboarding-actions onboarding-actions-ready">
        <button className="purr-primary" type="button" onClick={onClose}>
          Enter Purrdom
        </button>
        <button className="purr-link" type="button" onClick={onManageWallet}>
          Manage Wallet
        </button>
      </div>
    </>
  );
}

function PassportCard() {
  return (
    <div className="passport-card-sample" aria-label="Starter passport">
      <span>Purrdom Passport</span>
      <img alt="" src={PASSPORT_CAT_SRC} />
      <strong>Starter Hypurr</strong>
      <small>Signed locally</small>
      <em aria-hidden="true">
        <img alt="" src={STAMP_PAW_SRC} />
      </em>
    </div>
  );
}

function TrustList({ items }) {
  return (
    <div className="trust-list">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}
