window.Purrdom = window.Purrdom || {};

(function defineBiteShardMiningSystem(P) {
  class BiteShardMiningSystem {
    constructor(game) {
      this.game = game;
      this.active = false;
      this.elapsed = 0;
      this.duration = 5;
      this.lastReward = 0;
    }

    start() {
      if (this.active) return false;
      this.active = true;
      this.elapsed = 0;
      this.lastReward = 0;
      this.game.dialogue.say("BiteShards are forming...");
      return true;
    }

    update(dt) {
      if (!this.active) return;
      this.elapsed += dt;
      if (this.elapsed >= this.duration) {
        this.active = false;
        this.elapsed = this.duration;
        this.lastReward = 1 + Math.floor(Math.random() * 3);
        this.game.state.tokens.BiteShard += this.lastReward;
        this.game.animation.sparkle(this.game.player.x, this.game.player.y, "#48e5df");
        this.game.dialogue.say(`Mining cycle complete: +${this.lastReward} BiteShards.`);
        this.game.hud.render();
        if (this.game.panelManager.current === "biteshard") {
          this.game.panelManager.open("biteshard");
        }
      }
    }

    progress() {
      return Math.min(1, this.elapsed / this.duration);
    }
  }

  P.BiteShardMiningSystem = BiteShardMiningSystem;
})(window.Purrdom);
