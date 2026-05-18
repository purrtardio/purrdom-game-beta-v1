window.Purrdom = window.Purrdom || {};

(function defineLeaderboardPanel(P) {
  class LeaderboardPanel {
    static render(game) {
      const rows = game.leaderboardSystem.rows().map((row) => `
        <tr class="${row.isYou ? "you-row" : ""}">
          <td data-label="Rank">${row.rank}</td>
          <td data-label="User">${row.username}</td>
          <td data-label="Purr Points">${row.purrPoints.toLocaleString()}</td>
          <td data-label="Purrlings">${row.purrlings}</td>
          <td data-label="Item">${row.equippedItem}</td>
          <td data-label="Badge">${row.badge}</td>
        </tr>
      `).join("");
      return `
        <article class="panel">
          <header class="panel-header">
            <div>
              <div class="panel-eyebrow">Leaderboard</div>
              <h2>Kingdom Status</h2>
              <p>Mock ranked users, updated with your current session Purr Points.</p>
            </div>
            <button class="close-btn" data-close-panel aria-label="Close">x</button>
          </header>
          <table class="leader-table">
            <thead><tr><th>Rank</th><th>User</th><th>Purr Points</th><th>Purrlings</th><th>Item</th><th>Badge</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </article>
      `;
    }
  }

  P.LeaderboardPanel = LeaderboardPanel;
})(window.Purrdom);
