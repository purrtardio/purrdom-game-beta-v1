window.Purrdom = window.Purrdom || {};

(function defineZoneMap(P) {
  class ZoneMap {
    constructor(zoneId) {
      this.zoneId = zoneId;
      this.data = P.ZoneMapData[zoneId];
      this.zone = P.ZONE_DATA.find((item) => item.id === zoneId);
      this.tileMap = new P.TileMap(this.data);
      this.entities = [];
      this.interactables = [];
      this.build();
    }

    build() {
      this.placementsFor("decorations").forEach((placement) => {
        this.add(this.createEntity(P.DecorativeEntity, placement));
      });
      this.placementsFor("interactables").forEach((placement) => {
        const entity = this.createEntity(P.DeFiNode, placement);
        if (placement.zoneId) {
          entity.zone = P.ZONE_DATA.find((item) => item.id === placement.zoneId);
        }
        this.add(entity);
      });
      this.placementsFor("blockers").forEach((blocker) => {
        const entity = new P.DecorativeEntity({
          id: blocker.id,
          name: blocker.id,
          x: blocker.x,
          y: blocker.y,
          assetKey: blocker.assetKey || "zone1_stone_pillar",
          blocksMovement: true,
          collisionRadius: blocker.radius
        });
        entity.visible = false;
        this.add(entity);
      });
    }

    placementsFor(type) {
      const direct = this.data[type] || [];
      const layered = (this.data.layers || [])
        .filter((layer) => layer.type === type)
        .flatMap((layer) => layer.placements || []);
      return direct.concat(layered);
    }

    createEntity(Type, placement) {
      return new Type({
        id: placement.id,
        name: placement.name || placement.id,
        x: placement.x,
        y: placement.y,
        assetKey: placement.assetKey,
        blocksMovement: Boolean(placement.blocksMovement),
        collisionRadius: placement.collisionRadius || 0.55,
        label: placement.label || "",
        tooltip: placement.tooltip,
        dialogue: placement.dialogue,
        actionType: placement.actionType,
        interactionRadius: placement.interactionRadius,
        offsetY: placement.offsetY,
        scale: placement.scale,
        depth: placement.depth
      });
    }

    add(entity) {
      this.entities.push(entity);
      if (entity.interactable) {
        this.interactables.push(entity);
      }
      return entity;
    }
  }

  P.ZoneMap = ZoneMap;
})(window.Purrdom);
