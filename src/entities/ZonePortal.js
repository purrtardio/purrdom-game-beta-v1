window.Purrdom = window.Purrdom || {};

(function defineZonePortal(P) {
  class ZonePortal extends P.Entity {
    constructor({ id, name, x, y, radius, assetKey, nodeAsset, zone }) {
      super({ id, name, x, y, assetKey, blocksMovement: true, collisionRadius: radius || 1.4, label: zone.shortName });
      this.zone = zone;
      this.nodeAsset = nodeAsset;
      this.interactable = true;
      this.tooltip = zone.tooltip;
      this.actionType = "zone";
      this.interactionRadius = 2.6;
    }

    draw(renderer) {
      renderer.drawSprite(this.assetKey, this.x, this.y, { offsetY: 34 });
      renderer.drawSprite(this.nodeAsset, this.x + 0.95, this.y + 0.85, { offsetY: 20, scale: 0.85 });
      renderer.drawLabel(this.zone.shortName, this.x, this.y, "#fff7d7");
    }
  }

  P.ZonePortal = ZonePortal;
})(window.Purrdom);
