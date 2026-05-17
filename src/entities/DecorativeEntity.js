window.Purrdom = window.Purrdom || {};

(function defineDecorativeEntity(P) {
  class DecorativeEntity extends P.Entity {
    constructor(options) {
      super(options);
      this.interactable = false;
    }
  }

  P.DecorativeEntity = DecorativeEntity;
})(window.Purrdom);
