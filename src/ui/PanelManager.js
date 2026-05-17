window.Purrdom = window.Purrdom || {};

(function definePanelManager(P) {
  class PanelManager {
    constructor(game, root) {
      this.game = game;
      this.root = root;
      this.current = null;
      this.payload = null;
      this.closeFromEvent = (event) => {
        const close = event.target.closest && event.target.closest("[data-close-panel]");
        if (!close || !this.root.contains(close)) return;
        event.preventDefault();
        event.stopPropagation();
        this.close();
        setTimeout(() => this.close(), 0);
      };
      document.addEventListener("pointerdown", this.closeFromEvent, true);
      document.addEventListener("mousedown", this.closeFromEvent, true);
      document.addEventListener("touchend", this.closeFromEvent, true);
      document.addEventListener("click", this.closeFromEvent, true);
    }

    open(type, payload = null) {
      this.current = type;
      this.payload = payload;
      let html = "";
      if (type === "zone") html = P.ZonePanel.render(this.game, payload);
      if (type === "overview") html = P.ZonePanel.renderOverview(this.game);
      if (type === "equipment") html = P.EquipPanel.render(this.game);
      if (type === "breeding") html = P.BreedingPanel.render(this.game);
      if (type === "biteshard") html = P.BiteShardPanel.render(this.game);
      if (type === "leaderboard") html = P.LeaderboardPanel.render(this.game);
      if (type === "treasury") html = P.TreasuryPanel.render(this.game);
      if (type === "airdrop") html = P.AirdropPanel.render(this.game);
      if (type === "mysteryPack") html = P.MysteryPackPanel.render(this.game);
      this.root.innerHTML = html;
      this.bind();
      if (this.game.mobileControls) this.game.mobileControls.update();
    }

    close() {
      this.current = null;
      this.payload = null;
      this.root.innerHTML = "";
      if (this.game.mobileControls) this.game.mobileControls.update();
    }

    bind() {
      const close = this.root.querySelector("[data-close-panel]");
      if (close) {
        const closePanel = (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.close();
          setTimeout(() => this.close(), 0);
        };
        close.addEventListener("pointerdown", closePanel);
        close.addEventListener("click", closePanel);
        close.addEventListener("pointerup", closePanel);
        close.addEventListener("mousedown", closePanel);
        close.onclick = closePanel;
        close.onpointerdown = closePanel;
        close.onpointerup = closePanel;
        close.onmousedown = closePanel;
        close.ontouchend = closePanel;
      }

      const claim = this.root.querySelector("[data-claim-zone]");
      if (claim) {
        claim.addEventListener("click", () => {
          const result = this.game.zoneSystem.claim(claim.dataset.claimZone);
          if (result) this.open("zone", this.payload);
        });
      }

      const equip = this.root.querySelector("[data-equip-power-sock]");
      if (equip) {
        equip.addEventListener("click", () => {
          this.game.equipSystem.equipPowerSock();
          this.open("equipment");
        });
      }

      const mine = this.root.querySelector("[data-start-mining]");
      if (mine) {
        mine.addEventListener("click", () => {
          this.game.biteShardMiningSystem.start();
          this.open("biteshard");
        });
      }

      const pack = this.root.querySelectorAll("[data-open-pack]");
      pack.forEach((button) => {
        button.addEventListener("click", () => {
          this.game.dialogue.say(`${button.dataset.openPack} opened in simulation. No payment or wallet call was made.`);
          this.game.animation.sparkle(this.game.player.x, this.game.player.y, "#aa72ff");
        });
      });

      const details = this.root.querySelector("[data-zone-details]");
      if (details) {
        details.addEventListener("click", () => {
          this.game.dialogue.say("This zone reflects Hyperliquid activity through mock MVP data.");
        });
      }
    }
  }

  P.PanelManager = PanelManager;
})(window.Purrdom);
