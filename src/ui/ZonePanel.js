window.Purrdom = window.Purrdom || {};

(function defineZonePanel(P) {
  function stat(label, value) {
    return `<div class="stat-card"><span>${label}</span><strong>${value}</strong></div>`;
  }

  class ZonePanel {
    static render(game, zone) {
      const reward = P.TOKENS[zone.rewardToken];
      const boost = game.equipSystem.zoneApyBoost();
      const boostedApy = (zone.mockApy * (1 + boost / 100)).toFixed(2);
      const claims = game.state.claimedZones[zone.id] || 0;
      return `
        <article class="panel">
          <header class="panel-header">
            <div>
              <div class="panel-eyebrow">DeFi RPG Zone</div>
              <h2>${zone.name}</h2>
              <p>${zone.description}</p>
            </div>
            <button class="close-btn" data-close-panel aria-label="Close">x</button>
          </header>
          <div class="stat-grid">
            ${stat("Activity", zone.activity)}
            ${stat("Reward Token", reward.symbol)}
            ${stat("Mock APY Preview", `${boostedApy}%`)}
            ${stat("Power Sock Bonus", boost ? `+${boost}% APY` : "Not equipped")}
            ${stat("Minimum Activity", "Placeholder")}
            ${stat("Mock Claims", claims)}
          </div>
          <section class="panel-section">
            <p>${zone.flavor}</p>
            <p>No real API calls, token transfers, wallet checks, or transactions are performed.</p>
          </section>
          <div class="panel-actions">
            <button class="purr-btn" data-claim-zone="${zone.id}">Claim Mock Rewards</button>
            <button class="purr-btn secondary" data-zone-details>Details</button>
          </div>
        </article>
      `;
    }

    static renderOverview(game) {
      const rows = game.zoneSystem.overviewStats().map((zone) => `
        <tr>
          <td>${zone.name}</td>
          <td>${zone.activity}</td>
          <td>${P.TOKENS[zone.rewardToken].symbol}</td>
          <td>${zone.boostedApy.toFixed(2)}%</td>
        </tr>
      `).join("");
      return `
        <article class="panel">
          <header class="panel-header">
            <div>
              <div class="panel-eyebrow">Kingdom Map</div>
              <h2>Hyperliquid Ecosystem Overview</h2>
              <p>Seven protocol zones surround Purrdom Castle. Each panel is simulated MVP data.</p>
            </div>
            <button class="close-btn" data-close-panel aria-label="Close">x</button>
          </header>
          <table class="leader-table">
            <thead><tr><th>Zone</th><th>Activity</th><th>Reward</th><th>Preview</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </article>
      `;
    }
  }

  P.ZonePanel = ZonePanel;
})(window.Purrdom);
