window.Purrdom = window.Purrdom || {};

(function defineRenderer(P) {
  class Renderer {
    constructor(canvas, assets) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.assets = assets;
      this.tileWidth = 64;
      this.tileHeight = 32;
      this.width = 1280;
      this.height = 720;
      this.pixelRatio = 1;
      this.waterMode = this.resolveWaterMode();
      this.resize();
      window.addEventListener("resize", () => this.resize());
    }

    resolveWaterMode() {
      const allowedModes = ["old", "flat", "hybrid", "animated"];
      const defaultMode = "old";
      const params = new URLSearchParams(window.location.search);
      const requestedMode = params.get("water") || defaultMode;
      return allowedModes.includes(requestedMode) ? requestedMode : defaultMode;
    }

    setMapProjection(mapData) {
      const projection = (mapData && mapData.projection) || {};
      this.tileWidth = projection.tileWidth || 64;
      this.tileHeight = projection.tileHeight || 32;
    }

    resize() {
      this.pixelRatio = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * this.pixelRatio;
      this.canvas.height = this.height * this.pixelRatio;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
      this.ctx.imageSmoothingEnabled = false;
    }

    isMobilePortrait() {
      return this.width <= 780 && this.height > this.width;
    }

    isMobileLandscape() {
      return (this.width <= 900 && this.height <= 520) || (this.height <= 520 && this.width > this.height);
    }

    isMobileViewport() {
      return this.isMobilePortrait() || this.isMobileLandscape();
    }

    worldScale() {
      if (this.isMobilePortrait()) return 0.72;
      if (this.isMobileLandscape()) return 0.82;
      return 1;
    }

    worldToScreen(x, y) {
      return {
        x: (x - y) * (this.tileWidth / 2),
        y: (x + y) * (this.tileHeight / 2)
      };
    }

    clear() {
      const ctx = this.ctx;
      ctx.imageSmoothingEnabled = false;
      const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
      gradient.addColorStop(0, "#141b32");
      gradient.addColorStop(1, "#0e1324");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    render(game) {
      this.clear();
      this.withWorldScale(() => {
        this.drawTiles(game);
        this.drawEntities(game);
        this.drawEffects(game);
      });
      this.drawMiniMap(game);
    }

    withWorldScale(fn) {
      const scale = this.worldScale();
      if (scale === 1) {
        fn();
        return;
      }

      this.ctx.save();
      this.ctx.translate(this.width / 2, this.height / 2);
      this.ctx.scale(scale, scale);
      this.ctx.translate(-this.width / 2, -this.height / 2);
      fn();
      this.ctx.restore();
    }

    drawTiles(game) {
      const camera = game.camera;
      const time = (game.lastTime || 0) / 1000;
      const tiles = game.world.tileMap.tilesInDrawOrder();

      for (const tile of tiles) {
        const point = camera.apply(this.worldToScreen(tile.x, tile.y));
        if (!this.isTileVisible(point)) continue;
        if (tile.type === "water") {
          this.drawWaterTile(tile, point, time);
          continue;
        }

        this.drawTileImage(tile.asset, point);
      }
    }

    isTileVisible(point) {
      const margin = 180 / this.worldScale();
      return point.x > -margin && point.x < this.width + margin && point.y > -margin && point.y < this.height + margin;
    }

    drawTileImage(assetKey, point) {
      const image = this.assets.get(assetKey);
      const anchorY = 24;
      this.ctx.drawImage(image, point.x - image.width / 2, point.y - anchorY);
    }

    drawWaterTile(tile, point, time) {
      if (this.waterMode === "old" || (this.waterMode === "hybrid" && tile.waterRim)) {
        this.drawTileImage(tile.asset, point);
        return;
      }

      this.drawWaterSurface(tile, point, time);
    }

    drawWaterSurface(tile, point, time) {
      const variantNumber = this.waterMode === "animated"
        ? ((Math.floor(time * 2.4 + tile.waterPhase) % 3) + 1)
        : tile.waterVariant || 1;
      const variant = String(variantNumber).padStart(2, "0");
      const image = this.assets.get(`terrain_water_flat_${variant}`);
      const scale = Math.min(1, (this.tileWidth + 28) / image.width);
      const width = image.width * scale;
      const height = image.height * scale;
      const x = Math.round(point.x - width / 2);
      const y = Math.round(point.y - 6 * scale);
      this.drawWaterUnderlay(point);
      this.ctx.drawImage(image, x, y, width, height);
    }

    drawWaterUnderlay(point) {
      const ctx = this.ctx;
      const x = Math.round(point.x);
      const y = Math.round(point.y);
      const halfWidth = this.tileWidth / 2 + 14;
      const sideY = this.tileHeight / 2 + 6;
      const bottomY = this.tileHeight + 12;

      ctx.save();
      ctx.fillStyle = "#09b9df";
      ctx.beginPath();
      ctx.moveTo(x, y - 4);
      ctx.lineTo(x + halfWidth, y + sideY);
      ctx.lineTo(x, y + bottomY);
      ctx.lineTo(x - halfWidth, y + sideY);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = "#087ca8";
      ctx.beginPath();
      ctx.moveTo(x - halfWidth, y + sideY);
      ctx.lineTo(x, y + bottomY);
      ctx.lineTo(x + halfWidth, y + sideY);
      ctx.stroke();
      ctx.restore();
    }

    drawEntities(game) {
      const entities = game.world.entities
        .concat([game.player])
        .filter(Boolean)
        .sort((a, b) => (a.depth || a.x + a.y) - (b.depth || b.x + b.y));

      this.withCamera(game.camera, () => {
        for (const entity of entities) {
          if (entity.visible === false) continue;
          if (entity.draw) {
            entity.draw(this, game);
          } else {
            this.drawSprite(entity.assetKey, entity.x, entity.y, entity);
          }
        }
      });
    }

    drawSprite(assetKey, worldX, worldY, options = {}) {
      const image = this.assets.get(assetKey);
      const screen = this.worldToScreen(worldX, worldY);
      const point = options.camera ? options.camera.apply(screen) : this.currentCameraApply(screen);
      const offsetY = options.offsetY || 22;
      const scale = options.scale || 1;
      const w = image.width * scale;
      const h = image.height * scale;
      this.ctx.drawImage(image, point.x - w / 2, point.y + offsetY - h, w, h);
    }

    currentCameraApply(point) {
      if (!this.activeCamera) return point;
      return this.activeCamera.apply(point);
    }

    withCamera(camera, fn) {
      this.activeCamera = camera;
      fn();
      this.activeCamera = null;
    }

    drawLabel(text, worldX, worldY, color = "#f8fbff") {
      const screen = this.worldToScreen(worldX, worldY);
      const point = this.currentCameraApply(screen);
      const ctx = this.ctx;
      ctx.save();
      ctx.font = "11px monospace";
      const width = Math.ceil(ctx.measureText(text).width) + 12;
      const x = Math.round(point.x - width / 2);
      const y = Math.round(point.y - 82);
      ctx.fillStyle = "rgba(13, 17, 31, 0.78)";
      ctx.strokeStyle = "rgba(95, 232, 225, 0.48)";
      ctx.lineWidth = 1;
      ctx.fillRect(x, y, width, 20);
      ctx.strokeRect(x, y, width, 20);
      ctx.fillStyle = color;
      ctx.fillText(text, x + 6, y + 14);
      ctx.restore();
    }

    drawEffects(game) {
      const ctx = this.ctx;
      const camera = game.camera;
      for (const effect of game.effects) {
        const screen = camera.apply(this.worldToScreen(effect.x, effect.y));
        const alpha = Math.max(0, effect.life / effect.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = effect.color;
        for (let i = 0; i < 8; i += 1) {
          const angle = (Math.PI * 2 * i) / 8 + effect.age * 4;
          const dist = 10 + (1 - alpha) * 28;
          ctx.fillRect(
            Math.round(screen.x + Math.cos(angle) * dist),
            Math.round(screen.y - 30 + Math.sin(angle) * dist),
            4,
            4
          );
        }
        ctx.restore();
      }
    }

    drawMiniMap(game) {
      if (!this.isMobileViewport() || !game.world || !game.world.tileMap) return;

      const ctx = this.ctx;
      const size = this.isMobilePortrait() ? 92 : 108;
      const inset = 12;
      const x = this.width - size - inset;
      const y = this.isMobilePortrait() ? 138 : inset;
      const padding = 8;
      const map = game.world.tileMap;
      const projected = this.projectMiniMap(map, x + padding, y + padding, size - padding * 2);

      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = "rgba(10, 15, 28, 0.76)";
      ctx.fillRect(x, y, size, size);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(124, 244, 235, 0.42)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

      for (const tile of map.tiles) {
        const point = projected.point(tile.x + 0.5, tile.y + 0.5);
        ctx.fillStyle = this.miniMapTileColor(tile.type);
        ctx.fillRect(point.x, point.y, projected.dot, projected.dot);
      }

      for (const entity of game.world.entities) {
        if (!entity || (!entity.actionType && !entity.label)) continue;
        const point = projected.point(entity.x, entity.y);
        ctx.fillStyle = "rgba(255, 121, 207, 0.88)";
        ctx.fillRect(point.x - 1, point.y - 1, projected.dot + 2, projected.dot + 2);
      }

      const player = projected.point(game.player.x, game.player.y);
      ctx.fillStyle = "#ffc857";
      ctx.strokeStyle = "rgba(10, 15, 28, 0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x + projected.dot / 2, player.y + projected.dot / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    projectMiniMap(map, x, y, size) {
      const project = (tx, ty) => ({ x: tx - ty, y: (tx + ty) * 0.5 });
      const corners = [
        project(0, 0),
        project(map.width, 0),
        project(0, map.height),
        project(map.width, map.height)
      ];
      const minX = Math.min(...corners.map((point) => point.x));
      const maxX = Math.max(...corners.map((point) => point.x));
      const minY = Math.min(...corners.map((point) => point.y));
      const maxY = Math.max(...corners.map((point) => point.y));
      const scale = Math.min(size / (maxX - minX), size / (maxY - minY));
      const offsetX = x + (size - (maxX - minX) * scale) / 2;
      const offsetY = y + (size - (maxY - minY) * scale) / 2;
      return {
        dot: Math.max(2, Math.floor(scale * 1.15)),
        point(tx, ty) {
          const point = project(tx, ty);
          return {
            x: Math.round(offsetX + (point.x - minX) * scale),
            y: Math.round(offsetY + (point.y - minY) * scale)
          };
        }
      };
    }

    miniMapTileColor(type) {
      if (type === "water" || type === "outside") return "rgba(24, 99, 132, 0.82)";
      if (type === "canal") return "rgba(72, 229, 223, 0.72)";
      if (type === "path" || type === "entry-path") return "rgba(231, 208, 143, 0.86)";
      if (type === "platform" || type === "plaza" || type === "arena-center") return "rgba(176, 164, 222, 0.86)";
      if (type === "bridge") return "rgba(255, 200, 87, 0.82)";
      return "rgba(102, 185, 110, 0.86)";
    }
  }

  P.Renderer = Renderer;
})(window.Purrdom);
