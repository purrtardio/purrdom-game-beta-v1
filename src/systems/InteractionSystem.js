window.Purrdom = window.Purrdom || {};

(function defineInteractionSystem(P) {
  class InteractionSystem {
    constructor(game) {
      this.game = game;
      this.nearest = null;
    }

    update() {
      this.nearest = this.findNearest();
      if (this.nearest) {
        this.game.tooltip.show(`${this.nearest.tooltip} [E]`);
        this.game.hud.setActionHint(this.nearest.tooltip);
      } else {
        this.game.tooltip.hide();
        this.game.hud.setActionHint("Explore the kingdom");
      }
    }

    findNearest() {
      let nearest = null;
      let nearestDistance = Infinity;
      for (const entity of this.game.world.interactables) {
        const distance = entity.distanceTo(this.game.player);
        const radius = entity.interactionRadius || 2;
        if (distance < radius && distance < nearestDistance) {
          nearest = entity;
          nearestDistance = distance;
        }
      }
      return nearest;
    }

    interact() {
      const entity = this.nearest;
      if (!entity) {
        this.game.dialogue.say("Equip your Purrling to boost your kingdom status.");
        return;
      }
      if (entity.dialogue) {
        this.game.dialogue.say(entity.dialogue);
      }
      switch (entity.actionType) {
        case "zone":
          if (!this.game.enterZone(entity.zone.id)) {
            this.game.panelManager.open("zone", entity.zone);
          }
          break;
        case "zonePanel":
          this.game.panelManager.open("zone", entity.zone);
          break;
        case "returnWorld":
          this.game.returnToWorld();
          break;
        case "treasury":
          this.game.panelManager.open("treasury");
          break;
        case "leaderboard":
          this.game.panelManager.open("leaderboard");
          break;
        case "breeding":
          this.game.panelManager.open("breeding");
          break;
        case "biteshard":
          this.game.panelManager.open("biteshard");
          break;
        case "airdrop":
          this.game.panelManager.open("airdrop");
          break;
        case "mysteryPack":
          this.game.panelManager.open("mysteryPack");
          break;
        case "overview":
          this.game.panelManager.open("overview");
          break;
        case "sealed":
          this.game.dialogue.say("This mystery zone has not opened yet.");
          break;
        default:
          this.game.dialogue.say(entity.dialogue || "Welcome to Purrdom.");
      }
    }
  }

  P.InteractionSystem = InteractionSystem;
})(window.Purrdom);
