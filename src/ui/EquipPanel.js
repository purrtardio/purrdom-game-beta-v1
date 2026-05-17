window.Purrdom = window.Purrdom || {};

(function defineEquipPanel(P) {
  class EquipPanel {
    static render(game) {
      const purrling = P.PURRLINGS[game.state.equippedPurrling];
      const sock = P.ITEMS.legendaryPowerSock;
      const ownedPurrlings = game.state.ownedPurrlings.map((id) => {
        const item = P.PURRLINGS[id];
        return `
          <div class="inventory-slot">
            <img src="${game.assets.pathFor(item.asset)}" alt="">
            <strong>${item.name}</strong>
            <span class="hint">${item.rarity}</span>
          </div>
        `;
      }).join("");
      return `
        <article class="panel">
          <header class="panel-header">
            <div>
              <div class="panel-eyebrow">Equipment</div>
              <h2>Purrling + Legendary Power Sock</h2>
              <p>Equip bonuses are applied to mock APY previews, Purr Points, and summoning chance.</p>
            </div>
            <button class="close-btn" data-close-panel aria-label="Close">x</button>
          </header>
          <div class="stat-grid">
            <div class="stat-card"><span>Purrling Slot</span><strong>${purrling.name}</strong><p>${purrling.bonusLabel}</p></div>
            <div class="stat-card"><span>Power Sock Slot</span><strong>${game.state.equippedPowerSock ? "Equipped" : "Available"}</strong><p>${sock.description}</p></div>
            <div class="stat-card"><span>Zone Yield / APY</span><strong>+35%</strong></div>
            <div class="stat-card"><span>Purr Points</span><strong>+25%</strong></div>
            <div class="stat-card"><span>Mutation Chance</span><strong>+15%</strong></div>
            <div class="stat-card"><span>Badge</span><strong>OG Badge Active</strong></div>
          </div>
          <section class="panel-section">
            <div class="inventory-grid">
              ${ownedPurrlings}
              <div class="inventory-slot">
                <img src="${game.assets.pathFor(sock.asset)}" alt="">
                <strong>${sock.name}</strong>
                <span class="hint">${sock.rarity}</span>
              </div>
            </div>
          </section>
          <div class="panel-actions">
            <button class="purr-btn" data-equip-power-sock ${game.state.equippedPowerSock ? "disabled" : ""}>Equip</button>
          </div>
        </article>
      `;
    }
  }

  P.EquipPanel = EquipPanel;
})(window.Purrdom);
