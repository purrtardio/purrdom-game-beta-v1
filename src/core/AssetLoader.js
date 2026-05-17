window.Purrdom = window.Purrdom || {};

(function defineAssetLoader(P) {
  class AssetLoader {
    constructor() {
      this.assets = new Map();
      this.warnings = [];
    }

    loadAll(manifest) {
      return Promise.all(manifest.map((asset) => this.load(asset))).then(() => this);
    }

    load(asset) {
      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          this.assets.set(asset.key, image);
          resolve(image);
        };
        image.onerror = () => {
          const message = `Missing asset: ${asset.key} at ${asset.path}`;
          console.warn(message);
          this.warnings.push(message);
          const placeholder = this.createPlaceholder(asset.key, asset.category);
          this.assets.set(asset.key, placeholder);
          resolve(placeholder);
        };
        image.src = asset.path;
      });
    }

    get(key) {
      if (this.assets.has(key)) {
        return this.assets.get(key);
      }
      const message = `Asset not loaded: ${key}`;
      console.warn(message);
      this.warnings.push(message);
      const placeholder = this.createPlaceholder(key, "unknown");
      this.assets.set(key, placeholder);
      return placeholder;
    }

    pathFor(key) {
      const entry = P.AssetManifest.find((asset) => asset.key === key);
      return entry ? entry.path : "";
    }

    createPlaceholder(key, category) {
      const canvas = document.createElement("canvas");
      canvas.width = category === "terrain" || category === "paths" || category === "bridges" ? 96 : 72;
      canvas.height = category === "terrain" || category === "paths" || category === "bridges" ? 64 : 72;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "rgba(255,0,255,0.72)";
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 2;
      if (category === "terrain" || category === "paths" || category === "bridges") {
        ctx.beginPath();
        ctx.moveTo(48, 8);
        ctx.lineTo(82, 24);
        ctx.lineTo(48, 40);
        ctx.lineTo(14, 24);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(8, 8, canvas.width - 16, canvas.height - 16);
        ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
      }
      ctx.fillStyle = "#fff";
      ctx.font = "8px monospace";
      ctx.fillText(key.slice(0, 8), 8, canvas.height - 10);
      return canvas;
    }
  }

  P.AssetLoader = AssetLoader;
})(window.Purrdom);
