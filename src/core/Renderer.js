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
      const params = new URLSearchParams(window.location.search);
      const requestedMode = params.get("water") || "animated";
      return allowedModes.includes(requestedMode) ? requestedMode : "animated";
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
      this.drawTiles(game);
      this.drawEntities(game);
      this.drawEffects(game);
    }

    drawTiles(game) {
      const camera = game.camera;
      const time = (game.lastTime || 0) / 1000;
      const tiles = game.world.tileMap.tilesInDrawOrder();
      const waterTiles = tiles.filter((tile) => tile.type === "water");

      if (this.waterMode === "hybrid" || this.waterMode === "animated") {
        this.drawWaterField(waterTiles, camera, time);
      }

      for (const tile of tiles) {
        const point = camera.apply(this.worldToScreen(tile.x, tile.y));
        if (tile.type === "water") {
          this.drawWaterTile(tile, point);
          continue;
        }

        this.drawTileImage(tile.asset, point);
      }
    }

    drawTileImage(assetKey, point) {
      const image = this.assets.get(assetKey);
      const anchorY = 24;
      this.ctx.drawImage(image, point.x - image.width / 2, point.y - anchorY);
    }

    drawWaterTile(tile, point) {
      if (this.waterMode === "old" || (this.waterMode === "hybrid" && tile.waterRim)) {
        this.drawTileImage(tile.asset, point);
        return;
      }

      if (this.waterMode === "flat") {
        this.drawWaterSurface(tile, point);
      }
    }

    drawWaterSurface(tile, point) {
      const variant = String(tile.waterVariant || 1).padStart(2, "0");
      const image = this.assets.get(`terrain_water_flat_${variant}`);
      const scale = Math.min(1, (this.tileWidth + 28) / image.width);
      const width = image.width * scale;
      const height = image.height * scale;
      const x = Math.round(point.x - width / 2);
      const y = Math.round(point.y - 6 * scale);
      this.ctx.drawImage(image, x, y, width, height);
    }

    traceWaterSurface(point) {
      const x = Math.round(point.x);
      const y = Math.round(point.y);
      const halfWidth = this.tileWidth / 2 + 7;
      const halfHeight = this.tileHeight / 2 + 3;
      const bottom = this.tileHeight + 5;
      const ctx = this.ctx;

      ctx.beginPath();
      ctx.moveTo(x, y - 2);
      ctx.lineTo(x + halfWidth, y + halfHeight);
      ctx.lineTo(x, y + bottom);
      ctx.lineTo(x - halfWidth, y + halfHeight);
      ctx.closePath();
    }

    drawWaterField(waterTiles, camera, time) {
      if (!waterTiles.length) return;
      const ctx = this.ctx;

      ctx.save();
      ctx.beginPath();
      for (const tile of waterTiles) {
        const point = camera.apply(this.worldToScreen(tile.x, tile.y));
        const x = Math.round(point.x);
        const y = Math.round(point.y);
        const halfWidth = this.tileWidth / 2 + 7;
        const halfHeight = this.tileHeight / 2 + 3;
        const bottom = this.tileHeight + 5;
        ctx.moveTo(x, y - 2);
        ctx.lineTo(x + halfWidth, y + halfHeight);
        ctx.lineTo(x, y + bottom);
        ctx.lineTo(x - halfWidth, y + halfHeight);
        ctx.closePath();
      }

      const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
      gradient.addColorStop(0, "#1fdaf7");
      gradient.addColorStop(0.48, "#10badf");
      gradient.addColorStop(1, "#058ab8");
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.clip();
      this.drawWaterTexture(time);
      this.drawWaterCaustics(time);

      if (this.waterMode === "animated") {
        this.drawWaterWind(time);
      }
      this.drawWaterCoastFoam(waterTiles, camera, time);
      ctx.restore();
    }

    drawWaterTexture(time) {
      const texture = this.assets.get("terrain_water_texture");
      const pattern = this.ctx.createPattern(texture, "repeat");
      if (!pattern) return;

      const driftX = this.waterMode === "animated" ? (time * 7) % texture.width : 0;
      const driftY = this.waterMode === "animated" ? (time * 2) % texture.height : 0;
      this.ctx.save();
      this.ctx.globalAlpha = 0.24;
      this.ctx.translate(-driftX, -driftY);
      this.ctx.fillStyle = pattern;
      this.ctx.fillRect(driftX - texture.width, driftY - texture.height, this.width + texture.width * 2, this.height + texture.height * 2);
      this.ctx.restore();
    }

    drawWaterCaustics(time) {
      const ctx = this.ctx;
      ctx.lineWidth = 1;
      ctx.globalAlpha = this.waterMode === "animated" ? 0.12 : 0.08;
      ctx.strokeStyle = "#dffcff";

      for (let y = -40; y < this.height + 80; y += 38) {
        const rowOffset = ((time * 16 + y * 0.7) % 120) - 60;
        for (let x = -80 + rowOffset; x < this.width + 120; x += 108) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + 18, y - 8, x + 36, y);
          ctx.quadraticCurveTo(x + 54, y + 8, x + 72, y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "#064f87";
      for (let y = -20; y < this.height + 60; y += 52) {
        const rowOffset = ((time * 9 + y) % 140) - 70;
        for (let x = -80 + rowOffset; x < this.width + 120; x += 126) {
          ctx.beginPath();
          ctx.moveTo(x, y + 14);
          ctx.quadraticCurveTo(x + 22, y + 21, x + 44, y + 14);
          ctx.stroke();
        }
      }
    }

    drawWaterWind(time) {
      const ctx = this.ctx;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "#f6ffff";

      for (let y = -20; y < this.height + 70; y += 44) {
        const offset = ((time * 48 + y * 1.3) % 180) - 90;
        for (let x = -120 + offset; x < this.width + 160; x += 180) {
          ctx.beginPath();
          ctx.moveTo(x, y + 18);
          ctx.lineTo(x + 64, y);
          ctx.stroke();
        }
      }
    }

    drawWaterCoastFoam(waterTiles, camera, time) {
      const ctx = this.ctx;
      ctx.lineWidth = 1;
      for (const tile of waterTiles) {
        if (!tile.waterCoast || tile.waterRim) continue;
        const point = camera.apply(this.worldToScreen(tile.x, tile.y));
        ctx.globalAlpha = 0.12 + Math.sin(time * 2.4 + tile.waterPhase) * 0.04;
        ctx.strokeStyle = "#ffffff";
        this.traceWaterSurface(point);
        ctx.stroke();

        if ((tile.x + tile.y) % 2 === 0) {
          ctx.globalAlpha = 0.12;
          ctx.strokeStyle = "#4be8ff";
          ctx.beginPath();
          ctx.moveTo(point.x - this.tileWidth / 4, point.y + this.tileHeight / 2);
          ctx.quadraticCurveTo(point.x, point.y + this.tileHeight / 2 + 5, point.x + this.tileWidth / 4, point.y + this.tileHeight / 2);
          ctx.stroke();
        }
      }
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
  }

  P.Renderer = Renderer;
})(window.Purrdom);
