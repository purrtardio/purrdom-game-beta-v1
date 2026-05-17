window.Purrdom = window.Purrdom || {};

(function defineBreedingPreviewSystem(P) {
  class BreedingPreviewSystem {
    constructor(game) {
      this.game = game;
    }

    preview() {
      const baseMutationChance = 5;
      const powerSockBonus = this.game.equipSystem.mutationBonus();
      return {
        purrlingA: P.PURRLINGS[this.game.state.equippedPurrling],
        purrlingB: "Select second Purrling placeholder",
        cost: "250 $PURRLS + 50 $HYPERALS",
        baseMutationChance,
        powerSockBonus,
        finalMutationChance: baseMutationChance + powerSockBonus,
        notice: "Preview only in MVP. No real breeding logic or ownership checks."
      };
    }
  }

  P.BreedingPreviewSystem = BreedingPreviewSystem;
})(window.Purrdom);
