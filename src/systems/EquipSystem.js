window.Purrdom = window.Purrdom || {};

(function defineEquipSystem(P) {
  class EquipSystem {
    constructor(game) {
      this.game = game;
    }

    equipPowerSock() {
      if (!this.game.state.powerSockOwned || this.game.state.equippedPowerSock) return false;
      this.game.state.equippedPowerSock = true;
      this.game.player.powerSockGlow = true;
      this.game.dialogue.say("Legendary Power Sock equipped. OG badge active.");
      this.game.animation.sparkle(this.game.player.x, this.game.player.y, "#ffc857");
      this.game.hud.render();
      return true;
    }

    purrlingBonus() {
      const purrling = P.PURRLINGS[this.game.state.equippedPurrling];
      return purrling ? purrling.purrPointsBonus : 0;
    }

    powerSockPurrBonus() {
      return this.game.state.equippedPowerSock ? P.ITEMS.legendaryPowerSock.effects.purrPointsBoost : 0;
    }

    zoneApyBoost() {
      return this.game.state.equippedPowerSock ? P.ITEMS.legendaryPowerSock.effects.zoneApyBoost : 0;
    }

    mutationBonus() {
      return this.game.state.equippedPowerSock ? P.ITEMS.legendaryPowerSock.effects.mutationChance : 0;
    }

    totalPurrPointMultiplier() {
      return 1 + (this.purrlingBonus() + this.powerSockPurrBonus()) / 100;
    }
  }

  P.EquipSystem = EquipSystem;
})(window.Purrdom);
