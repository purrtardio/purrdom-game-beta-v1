window.Purrdom = window.Purrdom || {};

(function defineTileMap(P) {
  class TileMap {
    constructor(data) {
      this.key = data.key;
      this.width = data.width;
      this.height = data.height;
      this.tiles = [];
      this.walkable = new Map();
      for (let y = 0; y < this.height; y += 1) {
        for (let x = 0; x < this.width; x += 1) {
          const tile = data.terrainAt(x, y);
          this.tiles.push({ x, y, asset: tile.asset, type: tile.type, walkable: tile.walkable, drawDepth: x + y });
          this.walkable.set(data.key(x, y), tile.walkable);
        }
      }
      this.tiles.sort((a, b) => {
        if (a.drawDepth !== b.drawDepth) return a.drawDepth - b.drawDepth;
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
      });
    }

    tilesInDrawOrder() {
      return this.tiles;
    }

    isWalkable(x, y) {
      const tx = Math.round(x);
      const ty = Math.round(y);
      if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return false;
      return this.walkable.get(this.key(tx, ty)) !== false;
    }
  }

  P.TileMap = TileMap;
})(window.Purrdom);
