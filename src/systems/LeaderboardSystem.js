window.Purrdom = window.Purrdom || {};

(function defineLeaderboardSystem(P) {
  class LeaderboardSystem {
    constructor(game) {
      this.game = game;
    }

    rows() {
      const player = {
        rank: this.game.state.leaderboardRank,
        username: "You",
        purrPoints: Math.round(this.game.state.purrPoints),
        purrlings: this.game.state.ownedPurrlings.length,
        equippedItem: this.game.state.equippedPowerSock ? "Power Sock" : "None",
        badge: this.game.state.equippedPowerSock ? "OG" : "Starter",
        isYou: true
      };
      return P.LEADERBOARD.concat(player).sort((a, b) => a.rank - b.rank);
    }
  }

  P.LeaderboardSystem = LeaderboardSystem;
})(window.Purrdom);
