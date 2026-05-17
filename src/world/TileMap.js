window.Purrdom = window.Purrdom || {};

(function defineTileMap(P) {
  class TileMap {
    constructor(data) {
      this.key = data.key;
      this.width = data.width;
      this.height = data.height;
      this.tiles = [];
      this.walkable = new Map();
      this.tileByKey = new Map();
      for (let y = 0; y < this.height; y += 1) {
        for (let x = 0; x < this.width; x += 1) {
          const tile = data.terrainAt(x, y);
          const tileRecord = { x, y, asset: tile.asset, type: tile.type, walkable: tile.walkable, drawDepth: x + y };
          this.tiles.push(tileRecord);
          this.tileByKey.set(data.key(x, y), tileRecord);
          this.walkable.set(data.key(x, y), tile.walkable);
        }
      }
      this.decorateWaterTiles();
      this.tiles.sort((a, b) => {
        if (a.drawDepth !== b.drawDepth) return a.drawDepth - b.drawDepth;
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
      });
    }

    decorateWaterTiles() {
      const neighbors = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ];
      for (const tile of this.tiles) {
        if (tile.type !== "water") continue;
        tile.waterVariant = (Math.abs(tile.x * 31 + tile.y * 17) % 3) + 1;
        tile.waterRim = tile.x === 0 || tile.y === 0 || tile.x === this.width - 1 || tile.y === this.height - 1;
        tile.waterCoast = neighbors.some(([dx, dy]) => {
          const neighbor = this.tileByKey.get(this.key(tile.x + dx, tile.y + dy));
          return !neighbor || neighbor.type !== "water";
        });
        tile.waterPhase = Math.abs(tile.x * 19 - tile.y * 23) / 10;
      }
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
