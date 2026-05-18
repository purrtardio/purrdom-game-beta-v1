window.Purrdom = window.Purrdom || {};

(function defineMockUser(P) {
  P.MockUser = {
    username: "You",
    purrPoints: 1280,
    basePurrPointsRate: 1.4,
    leaderboardRank: 12,
    tokens: {
      PURRLS: 420,
      HYPERALS: 88,
      CLAW: 24,
      WHISK: 36,
      PAW: 51,
      SPARK: 15,
      GUARD: 18,
      BiteShard: 4
    },
    equippedPurrling: "starter",
    equippedPowerSock: false,
    powerSockOwned: true,
    ownedPurrlings: ["starter", "female", "rare"],
    ownedPacks: {
      commonPack: 1,
      mysteryPack: 0
    },
    wallet: {
      available: false,
      connected: false,
      connecting: false,
      mode: "none",
      address: null,
      chainId: null,
      chainName: "",
      providerName: "",
      signed: false,
      completed: false,
      guest: false,
      error: ""
    },
    claimedZones: {}
  };
})(window.Purrdom);
