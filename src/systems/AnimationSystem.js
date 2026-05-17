window.Purrdom = window.Purrdom || {};

(function defineAnimationSystem(P) {
  class AnimationSystem {
    constructor(game) {
      this.game = game;
    }

    sparkle(x, y, color = "#48e5df") {
      this.game.effects.push({ x, y, color, life: 0.8, maxLife: 0.8, age: 0 });
    }

    update(dt) {
      this.game.effects.forEach((effect) => {
        effect.life -= dt;
        effect.age += dt;
      });
      this.game.effects = this.game.effects.filter((effect) => effect.life > 0);
    }
  }

  P.AnimationSystem = AnimationSystem;
})(window.Purrdom);
