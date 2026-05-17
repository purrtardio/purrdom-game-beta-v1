window.Purrdom = window.Purrdom || {};

(function definePurrling(P) {
  class Purrling extends P.Entity {
    constructor({ x, y }) {
      super({ id: "starter-purrling", name: "Starter Purrling", x, y, assetKey: "purrling_standard_idle_down" });
      this.direction = "down";
      this.walkTime = 0;
      this.isMoving = false;
      this.trail = [];
    }

    update(dt, player) {
      this.trail.push({ x: player.x, y: player.y });
      if (this.trail.length > 24) {
        this.trail.shift();
      }
      const target = this.trail[0] || player;
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0.38) {
        const speed = 4.3;
        this.x += (dx / distance) * speed * dt;
        this.y += (dy / distance) * speed * dt;
        this.isMoving = true;
        this.walkTime += dt;
        if (Math.abs(dx) > Math.abs(dy)) {
          this.direction = dx > 0 ? "right" : "left";
        } else {
          this.direction = dy > 0 ? "down" : "up";
        }
      } else {
        this.isMoving = false;
      }
    }

    currentAsset() {
      if (!this.isMoving) {
        return `purrling_standard_idle_${this.direction}`;
      }
      const frame = (Math.floor(this.walkTime * 8) % 3) + 1;
      return `purrling_standard_walk_${this.direction}_${String(frame).padStart(2, "0")}`;
    }

    draw(renderer) {
      renderer.drawSprite(this.currentAsset(), this.x, this.y, { offsetY: 20 });
    }
  }

  P.Purrling = Purrling;
})(window.Purrdom);
