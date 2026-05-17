window.Purrdom = window.Purrdom || {};

(function definePlayer(P) {
  class Player extends P.Entity {
    constructor({ x, y }) {
      super({ id: "player", name: "You", x, y, assetKey: "player_idle_down" });
      this.direction = "down";
      this.speed = 5.2;
      this.walkTime = 0;
      this.isMoving = false;
      this.powerSockGlow = false;
    }

    update(dt, input, collisionMap) {
      const { sx, sy, direction } = input.movementVector();
      this.isMoving = sx !== 0 || sy !== 0;
      if (this.isMoving) {
        this.direction = direction || this.direction;
        this.walkTime += dt;
      } else {
        this.walkTime = 0;
      }
      collisionMap.moveWithCollision(this, sx * this.speed * dt, sy * this.speed * dt);
    }

    currentAsset() {
      if (!this.isMoving) {
        return `player_idle_${this.direction}`;
      }
      const prefix = `player_walk_${this.direction}_`;
      const frameCount = P.AssetManifest.filter((asset) => asset.key.startsWith(prefix)).length || 1;
      const frame = (Math.floor(this.walkTime * 8) % frameCount) + 1;
      return `player_walk_${this.direction}_${String(frame).padStart(2, "0")}`;
    }

    draw(renderer) {
      if (this.powerSockGlow) {
        const screen = renderer.currentCameraApply(renderer.worldToScreen(this.x, this.y));
        const ctx = renderer.ctx;
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = "#ffc857";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y + 2, 24, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.34;
        ctx.strokeStyle = "#48e5df";
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y - 11, 34, 46, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      renderer.drawSprite(this.currentAsset(), this.x, this.y, { offsetY: 28 });
    }
  }

  P.Player = Player;
})(window.Purrdom);
