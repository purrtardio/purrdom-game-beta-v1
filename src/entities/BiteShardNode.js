window.Purrdom = window.Purrdom || {};

(function defineBiteShardNode(P) {
  class BiteShardNode extends P.DeFiNode {
    constructor(options) {
      super({ ...options, actionType: "biteshard" });
    }
  }

  P.BiteShardNode = BiteShardNode;
})(window.Purrdom);
