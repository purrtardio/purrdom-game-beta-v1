window.Purrdom = window.Purrdom || {};

(function defineInputManager(P) {
  class InputManager {
    constructor(target = window) {
      this.keys = new Set();
      this.pressed = new Set();
      this.virtualMovement = { x: 0, y: 0 };
      target.addEventListener("keydown", (event) => this.onKeyDown(event));
      target.addEventListener("keyup", (event) => this.onKeyUp(event));
      target.addEventListener("blur", () => this.clear());
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) this.clear();
      });
    }

    onKeyDown(event) {
      const key = this.normalize(event.key);
      if (!key) return;
      if (!this.keys.has(key)) {
        this.pressed.add(key);
      }
      this.keys.add(key);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(key)) {
        event.preventDefault();
      }
    }

    onKeyUp(event) {
      const key = this.normalize(event.key);
      if (!key) return;
      this.keys.delete(key);
    }

    normalize(key) {
      if (key === " ") return "Space";
      if (key === "Escape") return "Escape";
      if (key.startsWith("Arrow")) return key;
      const upper = key.toUpperCase();
      if (upper === "ESCAPE") return "Escape";
      return ["W", "A", "S", "D", "E", "I", "M", "L", "T", "B", "R"].includes(upper) ? upper : null;
    }

    isDown(key) {
      return this.keys.has(key);
    }

    wasPressed(key) {
      return this.pressed.has(key);
    }

    consume(key) {
      const had = this.pressed.has(key);
      this.pressed.delete(key);
      return had;
    }

    triggerVirtualKey(key) {
      const normalized = this.normalize(key);
      if (!normalized) return;
      this.pressed.add(normalized);
    }

    setVirtualMovement(x, y) {
      const length = Math.sqrt(x * x + y * y);
      if (length < 0.08) {
        this.clearVirtualMovement();
        return;
      }
      const scale = length > 1 ? 1 / length : 1;
      this.virtualMovement = {
        x: x * scale,
        y: y * scale
      };
    }

    clearVirtualMovement() {
      this.virtualMovement = { x: 0, y: 0 };
    }

    movementVector() {
      let inputX = 0;
      let inputY = 0;
      if (this.isDown("A") || this.isDown("ArrowLeft")) inputX -= 1;
      if (this.isDown("D") || this.isDown("ArrowRight")) inputX += 1;
      if (this.isDown("W") || this.isDown("ArrowUp")) inputY -= 1;
      if (this.isDown("S") || this.isDown("ArrowDown")) inputY += 1;

      inputX += this.virtualMovement.x;
      inputY += this.virtualMovement.y;
      const inputLength = Math.sqrt(inputX * inputX + inputY * inputY);
      if (inputLength > 1) {
        inputX /= inputLength;
        inputY /= inputLength;
      }

      if (inputX === 0 && inputY === 0) {
        return { sx: 0, sy: 0, direction: null };
      }

      let sx = inputY + inputX;
      let sy = inputY - inputX;
      const length = Math.sqrt(sx * sx + sy * sy);
      sx /= length;
      sy /= length;

      const direction = Math.abs(inputX) > Math.abs(inputY)
        ? (inputX > 0 ? "right" : "left")
        : (inputY > 0 ? "down" : "up");

      return { sx, sy, direction };
    }

    endFrame() {
      this.pressed.clear();
    }

    clear() {
      this.keys.clear();
      this.pressed.clear();
      this.clearVirtualMovement();
    }
  }

  P.InputManager = InputManager;
})(window.Purrdom);
