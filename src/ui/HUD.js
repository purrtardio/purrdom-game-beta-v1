window.Purrdom = window.Purrdom || {};

(function defineHUD(P) {
  class HUD {
    constructor(game, element) {
      this.game = game;
      this.element = element;
      this.actionHint = "Explore the kingdom";
      this.collapsed = this.shouldDefaultCollapse();
      this.mobileExpanded = false;
      this.userToggled = false;
      this.element.addEventListener("click", (event) => {
        if (!event.target.closest("[data-toggle-hud]")) return;
        if (this.isMobileViewport()) {
          this.mobileExpanded = !this.mobileExpanded;
        } else {
          this.userToggled = true;
          this.collapsed = !this.collapsed;
        }
        this.render();
      });
      window.addEventListener("resize", () => this.syncResponsiveDefault());
      window.addEventListener("orientationchange", () => this.syncResponsiveDefault());
    }

    isMobilePortrait() {
      return window.matchMedia("(max-width: 780px) and (orientation: portrait)").matches;
    }

    isMobileLandscape() {
      return window.matchMedia("(max-height: 520px) and (orientation: landscape)").matches
        || (window.innerWidth <= 900 && window.innerHeight <= 520);
    }

    isMobileViewport() {
      return this.isMobilePortrait() || this.isMobileLandscape();
    }

    isCompactCopy() {
      return this.isMobileViewport() || window.matchMedia("(max-width: 780px)").matches;
    }

    shouldDefaultCollapse() {
      return false;
    }

    syncResponsiveDefault() {
      if (this.isMobileViewport()) {
        if (this.collapsed) {
          this.collapsed = false;
          if (this.game.equipSystem) this.render();
        }
        return;
      }
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

    tokenPill(tokenKey, compactLabel = null) {
      const token = P.TOKENS[tokenKey];
      const value = tokenKey === "PurrPoints" ? Math.round(this.game.state.purrPoints) : this.game.state.tokens[tokenKey];
      const symbol = compactLabel || token.symbol;
      return `
        <span class="pill">
          <img src="${this.game.assets.pathFor(token.asset)}" alt="">
          <strong>${value}</strong> ${symbol}
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
      if (this.isMobileViewport()) {
        this.element.classList.toggle("is-mobile-expanded", this.mobileExpanded);
        this.element.innerHTML = `
          <section class="hud-card hud-mobile-status">
            <div class="hud-mobile-row">
              <span class="brand-mark brand-mark-mini">P</span>
              ${this.tokenPill("PurrPoints", "Purr Pts")}
              ${this.tokenPill("BiteShard", "BiteShard")}
              <button class="hud-toggle hud-mobile-toggle" type="button" data-toggle-hud aria-expanded="${this.mobileExpanded}" aria-label="Toggle status details">
                ${this.mobileExpanded ? "Less" : "Stats"}
              </button>
            </div>
            <div class="hint action-hint">${this.actionHint}</div>
          </section>
          ${this.mobileExpanded ? `
            <section class="hud-card hud-mobile-sheet">
              <div class="token-row">
                ${this.tokenPill("PURRLS")}
                ${this.tokenPill("HYPERALS")}
              </div>
              <div class="bonus-row">
                <span class="pill">Purrling: <strong>${purrling.name}</strong></span>
                <span class="pill">Bonus: <strong>+${purrBonus}%</strong></span>
                <span class="pill">Power Sock: <strong>${this.game.state.equippedPowerSock ? "Equipped" : "Ready"}</strong></span>
                <span class="pill">Multiplier: <strong>${total}x</strong></span>
              </div>
              <div class="controls-row hint">
                <span>Joystick move</span>
                <span>Interact</span>
                <span>Menu for map, gear, ranks, treasury, mining</span>
              </div>
            </section>
          ` : ""}
        `;
        return;
      }

      this.element.classList.remove("is-mobile-expanded");
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
