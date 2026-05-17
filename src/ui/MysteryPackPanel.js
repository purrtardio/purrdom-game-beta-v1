window.Purrdom = window.Purrdom || {};

(function defineMysteryPackPanel(P) {
  class MysteryPackPanel {
    static render(game) {
      const packs = [
        { name: "Common Pack", price: "$9 tier", asset: "token_common_pack", rarity: "Common Purrling focus", chance: "Power Sock: rare drop placeholder" },
        { name: "Mystery Purrling Pack", price: "$25 tier", asset: "token_mystery_pack", rarity: "Common to Rare Purrlings", chance: "Power Sock: low simulated chance" },
        { name: "Legendary Chance Pack", price: "$69 tier", asset: "equipment_power_sock_inventory_card", rarity: "Rare to Legendary preview", chance: "Power Sock: featured simulated chance" }
      ].map((pack) => `
        <div class="pack-card">
          <img src="${game.assets.pathFor(pack.asset)}" alt="">
          <strong>${pack.name}</strong>
          <p>${pack.price}</p>
          <p class="hint">Supply: placeholder</p>
          <p class="hint">${pack.rarity}</p>
          <p class="hint">${pack.chance}</p>
          <button class="purr-btn" data-open-pack="${pack.name}">Open Pack</button>
        </div>
      `).join("");
      return `
        <article class="panel">
          <header class="panel-header">
            <div>
              <div class="panel-eyebrow">Mystery Pack Shop</div>
              <h2>Simulated Pack Preview</h2>
              <p>No real payments, wallet calls, token transfers, or ownership checks.</p>
            </div>
            <button class="close-btn" data-close-panel aria-label="Close">x</button>
          </header>
          <div class="pack-grid">${packs}</div>
        </article>
      `;
    }
  }

  P.MysteryPackPanel = MysteryPackPanel;
})(window.Purrdom);
