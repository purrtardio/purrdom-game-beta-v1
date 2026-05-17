window.Purrdom = window.Purrdom || {};

(function defineHUD(P) {
  class HUD {
    constructor(game, element) {
      this.game = game;
      this.element = element;
      this.actionHint = "Explore the kingdom";
      this.collapsed = this.shouldDefaultCollapse();
      this.userToggled = false;
      this.element.addEventListener("click", (event) => {
        if (!event.target.closest("[data-toggle-hud]")) return;
        this.userToggled = true;
        this.collapsed = !this.collapsed;
        this.render();
      });
      window.addEventListener("resize", () => this.syncResponsiveDefault());
      window.addEventListener("orientationchange", () => this.syncResponsiveDefault());
    }

    isMobileLandscape() {
      return window.matchMedia("(max-height: 520px) and (orientation: landscape)").matches
        || (window.innerWidth <= 900 && window.innerHeight <= 520);
    }

    isCompactCopy() {
      return this.isMobileLandscape() || window.matchMedia("(max-width: 780px)").matches;
    }

    shouldDefaultCollapse() {
      return this.isMobileLandscape();
    }

    syncResponsiveDefault() {
      if (this.userToggled) return;
      const collapsed = this.shouldDefaultCollapse();
      if (this.collapsed === collapsed) return;
      this.collapsed = collapsed;
      if (this.game.equipSystem) this.render();
    }

    setActionHint(text) {
      if (this.actionHint === text) return;
      this.actionHint = text;
      this.render();
    }

    tokenPill(tokenKey) {
      const token = P.TOKENS[tokenKey];
      const value = tokenKey === "PurrPoints" ? Math.round(this.game.state.purrPoints) : this.game.state.tokens[tokenKey];
      return `
        <span class="pill">
          <img src="${this.game.assets.pathFor(token.asset)}" alt="">
          <strong>${value}</strong> ${token.symbol}
        </span>
      `;
    }

    render() {
      this.element.classList.toggle("is-collapsed", this.collapsed);
      if (this.collapsed) {
        this.element.innerHTML = `
          <button class="hud-toggle hud-toggle-collapsed" type="button" data-toggle-hud aria-expanded="false" aria-label="Show dashboard">
            <span class="brand-mark brand-mark-mini">P</span>
            <span>HUD</span>
          </button>
        `;
        return;
      }

      const purrling = P.PURRLINGS[this.game.state.equippedPurrling];
      const purrBonus = this.game.equipSystem.purrlingBonus();
      const total = this.game.equipSystem.totalPurrPointMultiplier().toFixed(2);
      const controlLabels = this.isCompactCopy()
        ? ["Joystick move", "Interact", "Map", "Gear", "More actions"]
        : ["WASD/Arrows move", "E interact", "Space action", "I equipment", "M map", "L leaderboard", "T treasury", "B mining", "R reset"];
      this.element.innerHTML = `
        <div class="hud-toolbar">
          <button class="hud-toggle" type="button" data-toggle-hud aria-expanded="true" aria-label="Minimize dashboard">-</button>
        </div>
        <section class="hud-card hud-summary">
          <div class="hud-title">
            <div class="brand-mark">P</div>
            <div class="brand-copy">
              <strong>Purrdom</strong>
              <span>One super sleek interface. Hyperliquid as one living kingdom.</span>
            </div>
          </div>
          <div class="token-row">
            ${this.tokenPill("PurrPoints")}
            ${this.tokenPill("PURRLS")}
            ${this.tokenPill("HYPERALS")}
            ${this.tokenPill("BiteShard")}
          </div>
        </section>

        <section class="hud-card hud-bonuses">
          <div class="bonus-row">
            <span class="pill">Purrling: <strong>${purrling.name}</strong></span>
            <span class="pill">Bonus: <strong>+${purrBonus}%</strong></span>
            <span class="pill">Power Sock: <strong>${this.game.state.equippedPowerSock ? "Equipped" : "Ready"}</strong></span>
            <span class="pill">Multiplier: <strong>${total}x</strong></span>
          </div>
          <div class="hint">Base rate ${this.game.state.basePurrPointsRate}/sec + Purrling + Power Sock bonuses. Simulated MVP data only.</div>
        </section>

        <section class="hud-card hud-controls">
          <div class="hint action-hint">${this.actionHint}</div>
          <div class="controls-row hint">
            ${controlLabels.map((label) => `<span>${label}</span>`).join("")}
          </div>
        </section>
      `;
    }
  }

  P.HUD = HUD;
})(window.Purrdom);
