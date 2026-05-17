window.Purrdom = window.Purrdom || {};

(function defineZoneSystem(P) {
  class ZoneSystem {
    constructor(game) {
      this.game = game;
    }

    claim(zoneId) {
      const zone = P.ZONE_DATA.find((item) => item.id === zoneId);
      if (!zone) return null;
      const tokenGain = 4 + Math.floor(Math.random() * 7);
      const purrGain = Math.round(75 * this.game.equipSystem.totalPurrPointMultiplier());
      this.game.state.tokens[zone.rewardToken] = (this.game.state.tokens[zone.rewardToken] || 0) + tokenGain;
      this.game.state.purrPoints += purrGain;
      this.game.state.claimedZones[zoneId] = (this.game.state.claimedZones[zoneId] || 0) + 1;
      this.game.animation.sparkle(this.game.player.x, this.game.player.y, "#48e5df");
      this.game.dialogue.say(`Mock rewards claimed: +${tokenGain} ${P.TOKENS[zone.rewardToken].symbol}, +${purrGain} Purr Points.`);
      this.game.hud.render();
      return { tokenGain, purrGain };
    }

    overviewStats() {
      return P.ZONE_DATA.map((zone) => ({
        ...zone,
        boostedApy: zone.mockApy * (1 + this.game.equipSystem.zoneApyBoost() / 100)
      }));
    }
  }

  P.ZoneSystem = ZoneSystem;
})(window.Purrdom);
