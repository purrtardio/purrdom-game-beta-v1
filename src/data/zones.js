window.Purrdom = window.Purrdom || {};

(function defineZones(P) {
  P.ZONE_DATA = [
    {
      id: "perps",
      name: "Perps Arena",
      shortName: "Perps",
      activity: "Perps / Trading",
      rewardToken: "HYPERALS",
      mockApy: 18.4,
      asset: "zone_perps_arena",
      nodeAsset: "defi_trading_terminal",
      tooltip: "Open Perps Arena",
      description: "A high-energy trading colosseum where brave cats battle volatility.",
      flavor: "Where brave cats battle volatility."
    },
    {
      id: "lending",
      name: "Lending Halls",
      shortName: "Lending",
      activity: "Lending",
      rewardToken: "WHISK",
      mockApy: 9.7,
      asset: "zone_lending_halls",
      nodeAsset: "defi_lending_desk",
      tooltip: "Open Lending Halls",
      description: "A calm marble cat-bank where ledgers glow with simulated deposits.",
      flavor: "Quiet ledgers hum with blue-lamp yield."
    },
    {
      id: "liquidity",
      name: "Liquidity Dens",
      shortName: "Liquidity",
      activity: "Liquidity / LP",
      rewardToken: "PAW",
      mockApy: 22.1,
      asset: "zone_liquidity_dens",
      nodeAsset: "defi_liquidity_pool_altar",
      tooltip: "Inspect Liquidity Dens",
      description: "A cozy cave of teal liquidity pools, crystal containers, and LP fountains.",
      flavor: "Liquid magic pools below the den crystals."
    },
    {
      id: "vaults",
      name: "Vault Strongholds",
      shortName: "Vaults",
      activity: "Vault Strategies",
      rewardToken: "GUARD",
      mockApy: 14.8,
      asset: "zone_vault_stronghold",
      nodeAsset: "defi_vault_console",
      tooltip: "Open Vault Strongholds",
      description: "Fortified vault walls preview strategy performance and risk posture.",
      flavor: "The safest doors in the kingdom still glow blue."
    },
    {
      id: "drip",
      name: "Drip.Trade Marketplace",
      shortName: "Drip",
      activity: "Marketplace / Trading",
      rewardToken: "CLAW",
      mockApy: 11.5,
      asset: "zone_drip_marketplace",
      nodeAsset: "defi_marketplace_kiosk",
      tooltip: "Open Drip.Trade Marketplace",
      description: "A lively cosmetic and collectibles market with playful cat merchants.",
      flavor: "Rare looks, sharp claws, and a purple neon auction bell."
    },
    {
      id: "hyperevm",
      name: "HyperEVM Nexus",
      shortName: "HyperEVM",
      activity: "HyperEVM",
      rewardToken: "SPARK",
      mockApy: 16.9,
      asset: "zone_hyperevm_nexus",
      nodeAsset: "defi_protocol_monument",
      tooltip: "Open HyperEVM Nexus",
      description: "A tech-magic portal tower bridging the ecosystem through circuit runes.",
      flavor: "Every bridge hums like a teal spell."
    },
    {
      id: "fate",
      name: "Fate Arena / HIP-4 Arena",
      shortName: "Fate",
      activity: "HIP-4 / Fate / Prediction",
      rewardToken: "HYPERALS",
      mockApy: 20.3,
      asset: "zone_fate_arena",
      nodeAsset: "defi_activity_beacon",
      tooltip: "Open HIP-4 Fate Arena",
      description: "A mysterious oracle arena with a glowing fate pool and cosmic cat statues.",
      flavor: "The fate wheel spins, but this MVP keeps it simulated."
    }
  ];

  P.MYSTERY_ZONES = [
    { id: "mystery-island", name: "Locked Mystery Island", asset: "zone_mystery_locked_island", tooltip: "This zone is still sealed" },
    { id: "fog-portal", name: "Fog-Covered Portal", asset: "zone_fog_portal", tooltip: "This zone is still sealed" },
    { id: "unknown-gate", name: "Unknown Protocol Gate", asset: "zone_unknown_protocol_gate", tooltip: "This zone is still sealed" },
    { id: "sealed-door", name: "Sealed Rune Door", asset: "zone_sealed_rune_door", tooltip: "This zone is still sealed" }
  ];
})(window.Purrdom);
