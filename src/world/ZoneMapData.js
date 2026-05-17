window.Purrdom = window.Purrdom || {};

(function defineZoneMapData(P) {
  function key(x, y) {
    return `${x},${y}`;
  }

  function inEllipse(x, y, cx, cy, rx, ry) {
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    return dx * dx + dy * dy <= 1;
  }

  function nearLine(x, y, x1, y1, x2, y2, radius) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) return Math.hypot(x - x1, y - y1) <= radius;
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSq));
    const px = x1 + t * dx;
    const py = y1 + t * dy;
    return Math.hypot(x - px, y - py) <= radius;
  }

  function insidePerpsGround(x, y) {
    return (
      inEllipse(x, y, 18, 13, 14.5, 8.5) ||
      inEllipse(x, y, 18, 20, 11, 5.6) ||
      (x >= 15 && x <= 21 && y >= 20 && y <= 26)
    );
  }

  function perpsTerrainAt(x, y) {
    if (!insidePerpsGround(x, y)) {
      return { asset: "zone1_sand_water_block", walkable: false, type: "outside" };
    }
    if (x >= 15 && x <= 21 && y >= 18) {
      return { asset: "zone1_white_stone_tile", walkable: true, type: "entry-path" };
    }
    if (inEllipse(x, y, 18, 12, 8.8, 4.8)) {
      if (inEllipse(x, y, 18, 12, 3.6, 2)) {
        return { asset: "zone1_stone_tile_gold", walkable: true, type: "arena-center" };
      }
      return { asset: (x + y) % 2 === 0 ? "zone1_dirt_tile" : "zone1_white_stone_tile", walkable: true, type: "arena-ring" };
    }
    if (inEllipse(x, y, 18, 20, 9.5, 4.6)) {
      return { asset: (x + y) % 3 === 0 ? "zone1_grass_stone_tile" : "zone1_white_stone_tile", walkable: true, type: "plaza" };
    }
    if ((x * 5 + y * 3) % 11 === 0) {
      return { asset: "zone1_dirt_grass_block", walkable: true, type: "grass" };
    }
    return { asset: "zone1_grass_block", walkable: true, type: "grass" };
  }

  function insideLendingGround(x, y) {
    return (
      inEllipse(x, y, 20, 15, 16.5, 9) ||
      inEllipse(x, y, 8, 20, 7.2, 5.3) ||
      inEllipse(x, y, 32, 16, 7.6, 5.6) ||
      inEllipse(x, y, 20, 24, 8, 4.2)
    );
  }

  function lendingTerrainAt(x, y) {
    if (!insideLendingGround(x, y)) {
      return { asset: (x + y) % 4 === 0 ? "zone2_waterfall_tile" : "zone2_water_tile", walkable: false, type: "water" };
    }
    if (nearLine(x, y, 20, 24, 20, 17, 1.3)) {
      return { asset: "zone2_stone_path_tile", walkable: true, type: "entry-path" };
    }
    if (nearLine(x, y, 13, 20, 28, 18, 1.25) || nearLine(x, y, 20, 17, 13, 15, 1.05) || nearLine(x, y, 22, 17, 31, 14, 1.05)) {
      return { asset: (x + y) % 2 === 0 ? "zone2_plaza_tile" : "zone2_moss_path_tile", walkable: true, type: "path" };
    }
    if (inEllipse(x, y, 20, 17, 6.5, 3.8)) {
      return { asset: (x + y) % 3 === 0 ? "zone2_ornate_tile" : "zone2_plaza_tile", walkable: true, type: "plaza" };
    }
    if (inEllipse(x, y, 32, 16, 4.8, 3.2)) {
      return { asset: "zone2_stone_path_tile", walkable: true, type: "annex-plaza" };
    }
    if (inEllipse(x, y, 8, 20, 4.4, 3.1)) {
      return { asset: "zone2_moss_path_tile", walkable: true, type: "dock" };
    }
    if ((x * 3 + y * 5) % 17 === 0) {
      return { asset: "zone2_flower_tile", walkable: true, type: "garden" };
    }
    if ((x + y) % 11 === 0) {
      return { asset: "zone2_moss_path_tile", walkable: true, type: "garden" };
    }
    return { asset: "zone2_grass_tile", walkable: true, type: "garden" };
  }

  P.ZoneMapData = {
    perps: {
      id: "perps",
      width: 36,
      height: 28,
      spawn: { x: 18, y: 22 },
      returnSpawn: { x: 12.4, y: 9.2 },
      key,
      terrainAt: perpsTerrainAt,
      decorations: [
        { id: "arena-colosseum", assetKey: "zone1_arena_colosseum", x: 18, y: 10.6, scale: 1.35, offsetY: 86, depth: 15, blocksMovement: true, collisionRadius: 3.4 },
        { id: "arena-ring", assetKey: "zone1_arena_ring", x: 18, y: 13.6, scale: 1.22, offsetY: 30, depth: 26 },
        { id: "center-paw-tile", assetKey: "zone1_round_paw_tile", x: 18, y: 13.1, scale: 0.72, offsetY: 24, depth: 27 },
        { id: "ranking-board", assetKey: "zone1_ranking_board", x: 18, y: 7.6, scale: 0.95, offsetY: 52, depth: 12, blocksMovement: true, collisionRadius: 1.4 },
        { id: "left-wall", assetKey: "zone1_curved_wall", x: 9.8, y: 13.5, scale: 0.92, offsetY: 34, depth: 20, blocksMovement: true, collisionRadius: 1.15 },
        { id: "right-wall", assetKey: "zone1_curved_wall", x: 26.2, y: 13.5, scale: 0.92, offsetY: 34, depth: 20, blocksMovement: true, collisionRadius: 1.15 },
        { id: "left-banner-wall", assetKey: "zone1_banner_wall", x: 12.2, y: 17.4, scale: 0.86, offsetY: 32, depth: 31, blocksMovement: true, collisionRadius: 0.9 },
        { id: "right-banner-wall", assetKey: "zone1_banner_wall", x: 23.8, y: 17.4, scale: 0.86, offsetY: 32, depth: 31, blocksMovement: true, collisionRadius: 0.9 },
        { id: "left-torch", assetKey: "zone1_red_brazier", x: 14.2, y: 17.9, scale: 0.78, offsetY: 26, depth: 35, blocksMovement: true, collisionRadius: 0.55 },
        { id: "right-torch", assetKey: "zone1_red_brazier", x: 21.8, y: 17.9, scale: 0.78, offsetY: 26, depth: 35, blocksMovement: true, collisionRadius: 0.55 },
        { id: "left-front-torch", assetKey: "zone1_tall_brazier", x: 15.5, y: 21.2, scale: 0.72, offsetY: 24, depth: 39, blocksMovement: true, collisionRadius: 0.45 },
        { id: "right-front-torch", assetKey: "zone1_tall_brazier", x: 20.5, y: 21.2, scale: 0.72, offsetY: 24, depth: 39, blocksMovement: true, collisionRadius: 0.45 },
        { id: "prize-chest", assetKey: "zone1_reward_chest", x: 27.5, y: 20.3, scale: 0.85, offsetY: 26, depth: 48, blocksMovement: true, collisionRadius: 0.75, label: "Rewards" },
        { id: "left-target", assetKey: "zone1_target_red", x: 8.4, y: 20.2, scale: 0.82, offsetY: 26, depth: 38, blocksMovement: true, collisionRadius: 0.65 },
        { id: "right-target", assetKey: "zone1_target_red_alt", x: 27.8, y: 13.6, scale: 0.78, offsetY: 26, depth: 34, blocksMovement: true, collisionRadius: 0.65 },
        { id: "battle-rules", assetKey: "zone1_battle_rules_board", x: 9.1, y: 18.2, scale: 0.72, offsetY: 30, depth: 34, blocksMovement: true, collisionRadius: 0.8 },
        { id: "left-guard", assetKey: "zone1_npc_black_guard_front", x: 15.1, y: 20.5, scale: 0.86, offsetY: 26, depth: 43, blocksMovement: true, collisionRadius: 0.55, label: "Guard" },
        { id: "right-guard", assetKey: "zone1_npc_orange_guard_side", x: 20.9, y: 20.5, scale: 0.86, offsetY: 26, depth: 43, blocksMovement: true, collisionRadius: 0.55, label: "Guard" },
        { id: "left-flag", assetKey: "zone1_red_hanging_banner", x: 11.8, y: 9.2, scale: 0.8, offsetY: 36, depth: 18 },
        { id: "right-flag", assetKey: "zone1_blue_hanging_banner", x: 24.2, y: 9.2, scale: 0.8, offsetY: 36, depth: 18 },
        { id: "left-garden", assetKey: "zone1_palm_tree", x: 7.2, y: 22.7, scale: 0.82, offsetY: 28, depth: 42, blocksMovement: true, collisionRadius: 0.75 },
        { id: "right-garden", assetKey: "zone1_palm_tree_alt", x: 29.1, y: 22.1, scale: 0.82, offsetY: 28, depth: 42, blocksMovement: true, collisionRadius: 0.75 },
        { id: "front-left-fence", assetKey: "zone1_fence_green", x: 12.2, y: 24.2, scale: 0.78, offsetY: 24, depth: 47 },
        { id: "front-right-fence", assetKey: "zone1_fence_green", x: 23.8, y: 24.2, scale: 0.78, offsetY: 24, depth: 47 },
        { id: "coin-medal", assetKey: "zone1_red_medal", x: 18, y: 19.4, scale: 0.45, offsetY: 22, depth: 37 },
        { id: "blue-crystal", assetKey: "zone1_blue_lamp_small", x: 25.5, y: 19.3, scale: 0.62, offsetY: 24, depth: 40 }
      ],
      interactables: [
        {
          id: "perps-rewards-board",
          name: "Arena Leaderboard",
          assetKey: "zone1_chalkboard",
          x: 24.8,
          y: 17.2,
          scale: 0.72,
          offsetY: 30,
          depth: 42,
          label: "Perps Rewards",
          tooltip: "Open Perps Arena details",
          dialogue: "The Perps Arena board tracks simulated trading rewards.",
          actionType: "zonePanel",
          zoneId: "perps",
          blocksMovement: true,
          collisionRadius: 0.85,
          interactionRadius: 2.7
        },
        {
          id: "perps-return-gate",
          name: "Purrdom Gate",
          assetKey: "zone1_gate_arch",
          x: 18,
          y: 25,
          scale: 0.82,
          offsetY: 42,
          depth: 52,
          label: "World Map",
          tooltip: "Return to Purrdom",
          dialogue: "The south gate leads back to Purrdom.",
          actionType: "returnWorld",
          blocksMovement: false,
          collisionRadius: 0.7,
          interactionRadius: 2.4
        }
      ],
      blockers: [
        { id: "back-left-block", x: 13.5, y: 9.2, radius: 1.45 },
        { id: "back-center-block", x: 18, y: 8.8, radius: 2.15 },
        { id: "back-right-block", x: 22.5, y: 9.2, radius: 1.45 },
        { id: "left-stand-block", x: 10.5, y: 12.8, radius: 1.7 },
        { id: "right-stand-block", x: 25.5, y: 12.8, radius: 1.7 },
        { id: "front-left-wall-block", x: 12.5, y: 18.8, radius: 1.1 },
        { id: "front-right-wall-block", x: 23.5, y: 18.8, radius: 1.1 }
      ]
    },
    lending: {
      id: "lending",
      width: 42,
      height: 30,
      spawn: { x: 20, y: 25.3 },
      returnSpawn: { x: 28.4, y: 9.4 },
      key,
      terrainAt: lendingTerrainAt,
      layers: [
        {
          id: "ground-overlays",
          type: "decorations",
          placements: [
            { id: "central-round-plaza", assetKey: "zone2_round_plaza", x: 20, y: 17.1, scale: 0.86, offsetY: 26, depth: 25 },
            { id: "front-bridge", assetKey: "zone2_stone_bridge", x: 20, y: 24.9, scale: 0.82, offsetY: 30, depth: 39 },
            { id: "right-water-stairs", assetKey: "zone2_water_stairs", x: 31.7, y: 21.2, scale: 0.78, offsetY: 34, depth: 38 },
            { id: "left-dock-bridge", assetKey: "zone2_stone_bridge", x: 8.3, y: 22.4, scale: 0.72, offsetY: 30, depth: 34 },
            { id: "vault-arch", assetKey: "zone2_arch_gate", x: 30.1, y: 18.6, scale: 0.58, offsetY: 38, depth: 36 }
          ]
        },
        {
          id: "structures",
          type: "decorations",
          placements: [
            { id: "lending-halls-main", assetKey: "zone2_lending_halls", x: 20, y: 9.1, scale: 0.92, offsetY: 118, depth: 19, blocksMovement: true, collisionRadius: 4.4, label: "Lending Halls" },
            { id: "vault-annex", assetKey: "zone2_vault_annex", x: 33.3, y: 13.5, scale: 0.76, offsetY: 88, depth: 27, blocksMovement: true, collisionRadius: 2.15, label: "Vault Annex" },
            { id: "lending-kiosk", assetKey: "zone2_lending_kiosk", x: 7.7, y: 19.8, scale: 0.72, offsetY: 62, depth: 35, blocksMovement: true, collisionRadius: 1.45, label: "Kiosk" },
            { id: "trust-statue", assetKey: "zone2_trust_cat_statue", x: 10.9, y: 13.6, scale: 0.72, offsetY: 58, depth: 25, blocksMovement: true, collisionRadius: 1.05 },
            { id: "top-lenders-board", assetKey: "zone2_top_lenders_board", x: 30.3, y: 10.7, scale: 0.72, offsetY: 54, depth: 24, blocksMovement: true, collisionRadius: 1.05, label: "Top Lenders" }
          ]
        },
        {
          id: "props-and-gardens",
          type: "decorations",
          placements: [
            { id: "left-hall-banner", assetKey: "zone2_blue_banner", x: 15.4, y: 11.3, scale: 0.72, offsetY: 46, depth: 23 },
            { id: "right-hall-banner", assetKey: "zone2_blue_banner", x: 24.8, y: 11.4, scale: 0.72, offsetY: 46, depth: 23 },
            { id: "front-banner", assetKey: "zone2_floor_banner", x: 20.7, y: 22.2, scale: 0.65, offsetY: 42, depth: 41 },
            { id: "left-gate-lamp", assetKey: "zone2_lamp_tall", x: 16.4, y: 18.8, scale: 0.64, offsetY: 34, depth: 35, blocksMovement: true, collisionRadius: 0.45 },
            { id: "right-gate-lamp", assetKey: "zone2_lamp_tall", x: 23.6, y: 18.8, scale: 0.64, offsetY: 34, depth: 35, blocksMovement: true, collisionRadius: 0.45 },
            { id: "left-dock-lamp", assetKey: "zone2_lantern_post", x: 9.6, y: 22.2, scale: 0.62, offsetY: 32, depth: 36, blocksMovement: true, collisionRadius: 0.45 },
            { id: "right-annex-lamp", assetKey: "zone2_lantern_post", x: 34.8, y: 18.6, scale: 0.62, offsetY: 32, depth: 36, blocksMovement: true, collisionRadius: 0.45 },
            { id: "flower-arch", assetKey: "zone2_flower_arch", x: 13.1, y: 16.2, scale: 0.68, offsetY: 42, depth: 31, blocksMovement: true, collisionRadius: 0.75 },
            { id: "left-palm", assetKey: "zone2_palm_tree_large", x: 6.2, y: 14.4, scale: 0.72, offsetY: 48, depth: 28, blocksMovement: true, collisionRadius: 0.65 },
            { id: "right-palm", assetKey: "zone2_palm_tree", x: 35.8, y: 10.2, scale: 0.68, offsetY: 48, depth: 25, blocksMovement: true, collisionRadius: 0.65 },
            { id: "front-planter-left", assetKey: "zone2_planter_flowers", x: 15.7, y: 21.9, scale: 0.66, offsetY: 24, depth: 40 },
            { id: "front-planter-right", assetKey: "zone2_planter_flowers", x: 24.3, y: 21.9, scale: 0.66, offsetY: 24, depth: 40 },
            { id: "left-flower-box", assetKey: "zone2_flower_box", x: 11.9, y: 17.8, scale: 0.62, offsetY: 24, depth: 34 },
            { id: "right-flower-rocks", assetKey: "zone2_flower_rocks", x: 28.4, y: 18.7, scale: 0.62, offsetY: 22, depth: 36 },
            { id: "ledger-book", assetKey: "zone2_ledger_book", x: 27.6, y: 24.1, scale: 0.58, offsetY: 24, depth: 46 },
            { id: "vault-safe", assetKey: "zone2_vault_safe", x: 34.4, y: 16.4, scale: 0.55, offsetY: 28, depth: 34, blocksMovement: true, collisionRadius: 0.55 },
            { id: "purr-point-marker", assetKey: "zone2_purr_points_marker", x: 16.8, y: 14.8, scale: 0.5, offsetY: 26, depth: 30 },
            { id: "crystal-cluster-left", assetKey: "zone2_crystal_cluster", x: 14.1, y: 23.3, scale: 0.52, offsetY: 26, depth: 43 },
            { id: "crystal-cluster-right", assetKey: "zone2_crystal_node", x: 26.4, y: 20.6, scale: 0.52, offsetY: 26, depth: 39 },
            { id: "rope-barrier-left", assetKey: "zone2_rope_barrier", x: 15.8, y: 24.6, scale: 0.62, offsetY: 26, depth: 45 },
            { id: "rope-barrier-right", assetKey: "zone2_rope_barrier", x: 24.2, y: 24.6, scale: 0.62, offsetY: 26, depth: 45 }
          ]
        },
        {
          id: "npc-life",
          type: "decorations",
          placements: [
            { id: "lending-guard", assetKey: "zone2_npc_guard_front", x: 17.4, y: 20.2, scale: 0.72, offsetY: 28, depth: 39, blocksMovement: true, collisionRadius: 0.45, label: "Guard" },
            { id: "lending-courier", assetKey: "zone2_npc_courier_front", x: 13.1, y: 22.6, scale: 0.68, offsetY: 27, depth: 41, blocksMovement: true, collisionRadius: 0.45 },
            { id: "ledger-clerk", assetKey: "zone2_npc_blue_lender_front", x: 29.1, y: 24.3, scale: 0.68, offsetY: 27, depth: 45, blocksMovement: true, collisionRadius: 0.45 },
            { id: "crystal-holder", assetKey: "zone2_npc_crystal_holder", x: 22.5, y: 20.8, scale: 0.68, offsetY: 27, depth: 40, blocksMovement: true, collisionRadius: 0.45 }
          ]
        },
        {
          id: "content",
          type: "interactables",
          placements: [
            {
              id: "lending-ledger-crystal",
              name: "Lending Ledger",
              assetKey: "zone2_crystal_fountain",
              x: 20,
              y: 17.4,
              scale: 0.8,
              offsetY: 52,
              depth: 37,
              label: "Ledger",
              tooltip: "Open Lending Halls details",
              dialogue: "The lending ledger previews supplied assets, utilization, and rewards.",
              actionType: "zonePanel",
              zoneId: "lending",
              blocksMovement: true,
              collisionRadius: 1.1,
              interactionRadius: 3
            },
            {
              id: "deposit-supply-desk",
              name: "Deposit & Supply",
              assetKey: "zone2_deposit_supply_desk",
              x: 15.5,
              y: 17.1,
              scale: 0.62,
              offsetY: 44,
              depth: 36,
              label: "Deposit",
              tooltip: "Inspect supply desk",
              dialogue: "Deposit and supply flows are simulated for this prototype.",
              actionType: "zonePanel",
              zoneId: "lending",
              blocksMovement: true,
              collisionRadius: 0.9,
              interactionRadius: 2.4
            },
            {
              id: "borrow-lend-desk",
              name: "Borrow & Lend",
              assetKey: "zone2_borrow_lend_desk",
              x: 24.7,
              y: 17.6,
              scale: 0.62,
              offsetY: 44,
              depth: 37,
              label: "Borrow",
              tooltip: "Inspect borrow desk",
              dialogue: "Borrowing and lending actions will plug into this desk later.",
              actionType: "zonePanel",
              zoneId: "lending",
              blocksMovement: true,
              collisionRadius: 0.9,
              interactionRadius: 2.4
            },
            {
              id: "lending-return-gate",
              name: "Purrdom Gate",
              assetKey: "zone2_arch_gate",
              x: 20,
              y: 27,
              scale: 0.62,
              offsetY: 42,
              depth: 49,
              label: "World Map",
              tooltip: "Return to Purrdom",
              dialogue: "The southern bridge leads back to Purrdom.",
              actionType: "returnWorld",
              blocksMovement: false,
              collisionRadius: 0.7,
              interactionRadius: 2.5
            }
          ]
        },
        {
          id: "collision",
          type: "blockers",
          placements: [
            { id: "main-hall-left-block", x: 16.5, y: 10.1, radius: 2.1 },
            { id: "main-hall-center-block", x: 20, y: 9.8, radius: 2.5 },
            { id: "main-hall-right-block", x: 23.5, y: 10.1, radius: 2.1 },
            { id: "annex-block", x: 33.2, y: 13.7, radius: 2.15 },
            { id: "kiosk-block", x: 7.7, y: 19.8, radius: 1.35 },
            { id: "statue-block", x: 10.9, y: 13.6, radius: 0.95 },
            { id: "leaderboard-block", x: 30.3, y: 10.8, radius: 0.95 }
          ]
        }
      ]
    }
  };
})(window.Purrdom);
