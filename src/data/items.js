window.Purrdom = window.Purrdom || {};

(function defineItems(P) {
  P.ITEMS = {
    legendaryPowerSock: {
      id: "legendaryPowerSock",
      name: "Legendary Power Sock",
      rarity: "Legendary",
      asset: "equipment_power_sock_icon",
      badgeAsset: "equipment_power_sock_badge",
      effects: {
        zoneApyBoost: 35,
        purrPointsBoost: 25,
        mutationChance: 15,
        cosmeticGlow: true,
        ogBadge: true
      },
      description: "An OG relic that boosts zone previews, Purr Points, and summoning odds."
    },
    mysteryPack: {
      id: "mysteryPack",
      name: "Mystery Purrling Pack",
      asset: "token_mystery_pack",
      price: "$25",
      supply: "Season 0 placeholder"
    },
    commonPack: {
      id: "commonPack",
      name: "Common Pack",
      asset: "token_common_pack",
      price: "$9",
      supply: "Airdrop + shop placeholder"
    },
    biteShardCrystal: {
      id: "biteShardCrystal",
      name: "BiteShard Crystal",
      asset: "biteshard_crystal_node"
    }
  };
})(window.Purrdom);
