window.Purrdom = window.Purrdom || {};

(function definePurrlings(P) {
  P.PURRLINGS = {
    starter: {
      id: "starter",
      name: "Starter Purrling",
      type: "Standard Purrling",
      rarity: "Common",
      bonusLabel: "+5% Purr Points",
      purrPointsBonus: 5,
      asset: "purrling_standard_idle_down"
    },
    standard: {
      id: "standard",
      name: "Standard Purrling",
      type: "Standard",
      rarity: "Common",
      bonusLabel: "+5% Purr Points",
      purrPointsBonus: 5,
      asset: "purrling_common_variant"
    },
    female: {
      id: "female",
      name: "Female Purrling",
      type: "Female",
      rarity: "Common",
      bonusLabel: "+7% Summoning affinity",
      purrPointsBonus: 4,
      asset: "purrling_female_variant"
    },
    rare: {
      id: "rare",
      name: "Rare Purrling",
      type: "Mystic",
      rarity: "Rare",
      bonusLabel: "+12% Purr Points",
      purrPointsBonus: 12,
      asset: "purrling_rare_variant"
    },
    legendary: {
      id: "legendary",
      name: "Legendary Purrling",
      type: "Royal",
      rarity: "Legendary",
      bonusLabel: "+20% Purr Points",
      purrPointsBonus: 20,
      asset: "purrling_legendary_variant"
    }
  };
})(window.Purrdom);
