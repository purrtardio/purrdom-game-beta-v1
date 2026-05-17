window.Purrdom = window.Purrdom || {};

(function defineAirdropPanel(P) {
  class AirdropPanel {
    static render() {
      return `
        <article class="panel">
          <header class="panel-header">
            <div>
              <div class="panel-eyebrow">Kingdom Awakening Shrine</div>
              <h2>Airdrop Information</h2>
              <p>Informational only. Automatic mock distribution, no claim, no gas.</p>
            </div>
            <button class="close-btn" data-close-panel aria-label="Close">x</button>
          </header>
          <div class="stat-grid">
            <div class="stat-card"><span>Hypurr Holders</span><strong>1:1 Standard Purrlings</strong></div>
            <div class="stat-card"><span>Purrtardio Holders</span><strong>1:1 Female Purrlings</strong></div>
            <div class="stat-card"><span>Socks Holders</span><strong>1:1 Legendary Power Sock</strong></div>
            <div class="stat-card"><span>Active Hyperliquid Users</span><strong>Free Common Packs</strong></div>
            <div class="stat-card"><span>Claim Flow</span><strong>Automatic</strong></div>
            <div class="stat-card"><span>Gas</span><strong>None</strong></div>
          </div>
        </article>
      `;
    }
  }

  P.AirdropPanel = AirdropPanel;
})(window.Purrdom);
