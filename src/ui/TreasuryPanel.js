window.Purrdom = window.Purrdom || {};

(function defineTreasuryPanel(P) {
  class TreasuryPanel {
    static render(game) {
      const data = game.treasurySystem.data;
      const rows = [
        ["Total Revenue", data.totalRevenue],
        ["LP Funding Pool", data.lpFundingPool],
        ["$PURRLS Buyback Allocation", data.purrlsBuybackAllocation],
        ["$HYPERALS Buyback Allocation", data.hyperalsBuybackAllocation],
        ["Power Token Buyback Allocation", data.powerTokenBuybackAllocation],
        ["Multisig Status", data.multisigStatus],
        ["LP Lock", data.lpLock]
      ].map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`).join("");
      return `
        <article class="panel">
          <header class="panel-header">
            <div>
              <div class="panel-eyebrow">Transparent Treasury</div>
              <h2>Kingdom Treasury</h2>
              <p>Mock treasury values and buyback routing for the MVP dashboard.</p>
            </div>
            <button class="close-btn" data-close-panel aria-label="Close">x</button>
          </header>
          <table class="treasury-table"><tbody>${rows}</tbody></table>
          <section class="panel-section">
            ${data.mechanism.map((line) => `<p>${line}</p>`).join("")}
          </section>
        </article>
      `;
    }
  }

  P.TreasuryPanel = TreasuryPanel;
})(window.Purrdom);
