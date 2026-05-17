window.Purrdom = window.Purrdom || {};

(function defineNPC(P) {
  class NPC extends P.Entity {
    constructor(options) {
      super(options);
      this.dialogue = options.dialogue || "Welcome to Purrdom.";
      this.interactable = true;
      this.tooltip = options.tooltip || "Talk";
      this.actionType = "dialogue";
    }
  }

  P.NPC = NPC;
})(window.Purrdom);
