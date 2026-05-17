window.Purrdom = window.Purrdom || {};

(function defineEntity(P) {
  class Entity {
    constructor({ id, name, x, y, assetKey, blocksMovement = false, collisionRadius = 0.55, label = "", offsetY, scale, depth }) {
      this.id = id;
      this.name = name || id;
      this.x = x;
      this.y = y;
      this.assetKey = assetKey;
      this.blocksMovement = blocksMovement;
      this.collisionRadius = collisionRadius;
      this.label = label;
      this.offsetY = offsetY;
      this.scale = scale;
      this.depth = depth;
      this.visible = true;
    }

    distanceTo(other) {
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    draw(renderer) {
      renderer.drawSprite(this.assetKey, this.x, this.y, {
        offsetY: this.offsetY === undefined ? 24 : this.offsetY,
        scale: this.scale || 1
      });
      if (this.label) {
        renderer.drawLabel(this.label, this.x, this.y);
      }
    }
  }

  P.Entity = Entity;
})(window.Purrdom);
