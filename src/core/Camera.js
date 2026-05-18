window.Purrdom = window.Purrdom || {};

(function defineCamera(P) {
  class Camera {
    constructor(renderer) {
      this.renderer = renderer;
      this.x = 0;
      this.y = 0;
      this.targetX = 0;
      this.targetY = 0;
      this.bounds = { minX: -900, minY: -100, maxX: 900, maxY: 1300 };
    }

    setBounds(bounds) {
      this.bounds = bounds;
    }

    follow(worldX, worldY, dt) {
      const point = this.renderer.worldToScreen(worldX, worldY);
      this.targetX = point.x;
      this.targetY = point.y + this.followOffsetY();
      const follow = Math.min(1, dt * 6);
      this.x += (this.targetX - this.x) * follow;
      this.y += (this.targetY - this.y) * follow;
      this.clamp();
    }

    followOffsetY() {
      const w = this.renderer.width;
      const h = this.renderer.height;
      if (w <= 780 && h > w) {
        return Math.min(132, Math.max(72, h * 0.14));
      }
      if (w <= 900 && h <= 520) {
        return 42;
      }
      return 14;
    }

    clamp() {
      const vw = this.renderer.width;
      const vh = this.renderer.height;
      const minX = this.bounds.minX + vw / 2;
      const maxX = this.bounds.maxX - vw / 2;
      const minY = this.bounds.minY + vh / 2;
      const maxY = this.bounds.maxY - vh / 2;
      this.x = minX <= maxX ? Math.max(minX, Math.min(maxX, this.x)) : (this.bounds.minX + this.bounds.maxX) / 2;
      this.y = minY <= maxY ? Math.max(minY, Math.min(maxY, this.y)) : (this.bounds.minY + this.bounds.maxY) / 2;
    }

    apply(screenPoint) {
      return {
        x: Math.round(screenPoint.x - this.x + this.renderer.width / 2),
        y: Math.round(screenPoint.y - this.y + this.renderer.height / 2)
      };
    }
  }

  P.Camera = Camera;
})(window.Purrdom);
