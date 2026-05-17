window.Purrdom = window.Purrdom || {};

(function defineWorldZones(P) {
  P.WorldZones = [
    { id: "perps", x: 10, y: 7, radius: 2.25 },
    { id: "lending", x: 28, y: 7, radius: 2.15 },
    { id: "liquidity", x: 7, y: 15, radius: 2.25 },
    { id: "vaults", x: 32, y: 15, radius: 2.25 },
    { id: "drip", x: 11, y: 21, radius: 2.15 },
    { id: "hyperevm", x: 35, y: 8, radius: 2.15 },
    { id: "fate", x: 29, y: 22, radius: 2.2 }
  ];

  P.SpecialInteractions = [
    {
      id: "treasury",
      name: "Treasury Tower",
      type: "treasury",
      x: 20,
      y: 24,
      asset: "building_treasury_tower",
      tooltip: "Open transparent treasury",
      dialogue: "The treasury is transparent."
    },
    {
      id: "leaderboard",
      name: "Leaderboard Tower",
      type: "leaderboard",
      x: 20,
      y: 10,
      asset: "building_leaderboard_tower",
      tooltip: "View kingdom leaderboard",
      dialogue: "Your activity becomes Purr Points."
    },
    {
      id: "summoning",
      name: "Royal Summoning Portal",
      type: "breeding",
      x: 20,
      y: 19,
      asset: "building_summoning_portal",
      tooltip: "Preview breeding",
      dialogue: "The Royal Summoning Portal is preview-only in MVP."
    },
    {
      id: "mystery-pack",
      name: "Mystery Pack Shop",
      type: "mysteryPack",
      x: 14,
      y: 22,
      asset: "building_mystery_pack_shop",
      tooltip: "Open Mystery Pack shop",
      dialogue: "Mystery packs are simulated in this prototype."
    },
    {
      id: "airdrop",
      name: "Airdrop Shrine",
      type: "airdrop",
      x: 4,
      y: 24,
      asset: "building_airdrop_shrine",
      tooltip: "Inspect airdrop information",
      dialogue: "The kingdom awakens on Week 4."
    },
    {
      id: "biteshard",
      name: "BiteShard Cave",
      type: "biteshard",
      x: 25,
      y: 22,
      asset: "biteshard_mining_cave",
      tooltip: "Mine BiteShards",
      dialogue: "BiteShards are forming..."
    }
  ];
})(window.Purrdom);
