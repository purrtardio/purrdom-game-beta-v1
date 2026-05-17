window.Purrdom = window.Purrdom || {};

(function defineCollisionMap(P) {
  class CollisionMap {
    constructor(tileMap, blockers = []) {
      this.tileMap = tileMap;
      this.blockers = blockers;
    }

    setBlockers(blockers) {
      this.blockers = blockers;
    }

    isWalkable(x, y) {
      if (!this.tileMap.isWalkable(x, y)) return false;
      return !this.blockers.some((blocker) => {
        if (!blocker.blocksMovement) return false;
        const dx = x - blocker.x;
        const dy = y - blocker.y;
        const radius = blocker.collisionRadius || 0.7;
        return Math.sqrt(dx * dx + dy * dy) < radius;
      });
    }

    moveWithCollision(entity, dx, dy) {
      const nextX = entity.x + dx;
      const nextY = entity.y + dy;
      if (this.isWalkable(nextX, entity.y)) {
        entity.x = nextX;
      }
      if (this.isWalkable(entity.x, nextY)) {
        entity.y = nextY;
      }
    }
  }

  P.CollisionMap = CollisionMap;
})(window.Purrdom);
