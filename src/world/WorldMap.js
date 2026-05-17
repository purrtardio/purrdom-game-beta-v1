window.Purrdom = window.Purrdom || {};

(function defineWorldMap(P) {
  class WorldMap {
    constructor() {
      this.tileMap = new P.TileMap(P.MapData);
      this.entities = [];
      this.interactables = [];
      this.build();
    }

    build() {
      this.addCoreKingdom();
      this.addZones();
      this.addSpecials();
      this.addMysteryZones();
      this.addDecorations();
    }

    add(entity) {
      this.entities.push(entity);
      if (entity.interactable) {
        this.interactables.push(entity);
      }
      return entity;
    }

    addCoreKingdom() {
      this.add(new P.DecorativeEntity({ id: "castle", name: "Purrdom Castle", x: 20, y: 14, assetKey: "building_purrdom_castle", blocksMovement: true, collisionRadius: 1.55, label: "Purrdom Castle" }));
      this.add(new P.DeFiNode({ id: "purr-points-fountain", name: "Purr Points Fountain", x: 18.2, y: 17.2, assetKey: "defi_purr_points_fountain", tooltip: "Your activity becomes Purr Points", dialogue: "Welcome to Purrdom.", actionType: "overview" }));
      this.add(new P.DecorativeEntity({ id: "hyperals-crystal", name: "HYPERALS Crystal", x: 21.8, y: 17.2, assetKey: "defi_zone_boost_crystal", label: "HYPERALS" }));
      this.add(new P.DecorativeEntity({ id: "notice-board", name: "Notice Board", x: 17.3, y: 12.1, assetKey: "building_notice_board", label: "Week 4" }));
      this.add(new P.DecorativeEntity({ id: "power-sock-shrine", name: "Power Sock Shrine", x: 8.2, y: 24.4, assetKey: "equipment_power_sock_shrine", label: "Power Sock" }));
      this.add(new P.DecorativeEntity({ id: "buyback-forge", name: "Buyback Forge", x: 27.2, y: 24.1, assetKey: "building_equipment_forge", label: "Buyback" }));
    }

    addZones() {
      P.WorldZones.forEach((placement) => {
        const data = P.ZONE_DATA.find((zone) => zone.id === placement.id);
        this.add(new P.ZonePortal({
          id: data.id,
          name: data.name,
          x: placement.x,
          y: placement.y,
          radius: placement.radius,
          assetKey: data.asset,
          nodeAsset: data.nodeAsset,
          zone: data
        }));
      });
    }

    addSpecials() {
      P.SpecialInteractions.forEach((item) => {
        this.add(new P.DeFiNode({
          id: item.id,
          name: item.name,
          x: item.x,
          y: item.y,
          assetKey: item.asset,
          tooltip: item.tooltip,
          dialogue: item.dialogue,
          actionType: item.type,
          blocksMovement: true,
          collisionRadius: 0.9
        }));
      });
    }

    addMysteryZones() {
      const placements = [
        { x: 3, y: 14 },
        { x: 38, y: 14 },
        { x: 4, y: 26 },
        { x: 37, y: 25 }
      ];
      P.MYSTERY_ZONES.forEach((zone, index) => {
        const placement = placements[index];
        this.add(new P.DeFiNode({
          id: zone.id,
          name: zone.name,
          x: placement.x,
          y: placement.y,
          assetKey: zone.asset,
          tooltip: zone.tooltip,
          dialogue: "This mystery zone has not opened yet.",
          actionType: "sealed",
          blocksMovement: true,
          collisionRadius: 1
        }));
      });
    }

    addDecorations() {
      const decorations = [
        ["prop_cat_statue", 18.4, 13.1],
        ["prop_cat_statue", 21.7, 13.1],
        ["prop_banner", 16.1, 14.4],
        ["prop_flag", 23.5, 14.6],
        ["prop_lantern_glowing", 17.2, 18.4],
        ["prop_lantern_glowing", 22.8, 18.4],
        ["prop_bridge_lamp", 13.2, 10.5],
        ["prop_bridge_lamp", 27.4, 11.3],
        ["prop_bridge_lamp", 10.1, 20.3],
        ["prop_bridge_lamp", 28.1, 20.3],
        ["prop_defi_kiosk", 25.4, 18.8],
        ["prop_magic_terminal", 15.1, 18.9],
        ["prop_fountain", 20, 17.6],
        ["prop_treasure_chest", 22.8, 16.4],
        ["prop_token_crate", 16.5, 16.5],
        ["prop_paw_print", 20.8, 18.4],
        ["prop_flowering_bush", 13.5, 9.8],
        ["prop_flowering_bush", 30.8, 10.1],
        ["prop_mushroom_magic", 6.2, 18.4],
        ["prop_bush", 34.3, 18.3],
        ["prop_round_tree", 6.2, 11.2],
        ["prop_round_tree", 34.1, 11.5],
        ["prop_crystal_tree", 24.2, 12.1],
        ["prop_crystal_tree", 13.8, 23.7],
        ["bridge_fantasy_boat", 2.2, 8.5],
        ["bridge_fantasy_boat", 38.5, 6.7],
        ["bridge_fantasy_boat", 33.4, 26.4],
        ["bridge_airship_dock", 6.6, 25.6],
        ["prop_glowing_crystal", 25.5, 23.8],
        ["prop_glowing_crystal", 30.7, 20.3],
        ["prop_rune_stone", 15.8, 11.2],
        ["prop_rune_stone", 24.2, 11.4]
      ];
      decorations.forEach(([assetKey, x, y], index) => {
        this.add(new P.DecorativeEntity({ id: `decor-${index}`, x, y, assetKey }));
      });
    }
  }

  P.WorldMap = WorldMap;
})(window.Purrdom);
