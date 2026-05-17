window.Purrdom = window.Purrdom || {};

(function defineDeFiNode(P) {
  class DeFiNode extends P.Entity {
    constructor(options) {
      super(options);
      this.interactable = true;
      this.tooltip = options.tooltip;
      this.dialogue = options.dialogue;
      this.actionType = options.actionType;
      this.interactionRadius = options.interactionRadius || 2.1;
    }

    draw(renderer) {
      renderer.drawSprite(this.assetKey, this.x, this.y, {
        offsetY: this.offsetY === undefined ? 26 : this.offsetY,
        scale: this.scale || 1
      });
      if (this.label) {
        renderer.drawLabel(this.label, this.x, this.y);
      }
    }
  }

  P.DeFiNode = DeFiNode;
})(window.Purrdom);
