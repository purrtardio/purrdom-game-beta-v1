window.Purrdom = window.Purrdom || {};

(function defineBiteShardPanel(P) {
  class BiteShardPanel {
    static render(game) {
      const mining = game.biteShardMiningSystem;
      const progress = Math.round(mining.progress() * 100);
      return `
        <article class="panel">
          <header class="panel-header">
            <div>
              <div class="panel-eyebrow">Browser Mining</div>
              <h2>BiteShard Mining Cave</h2>
              <p>Mine simulated BiteShards in 5 second browser cycles. Reward: 1-3 BiteShards.</p>
            </div>
            <button class="close-btn" data-close-panel aria-label="Close">x</button>
          </header>
          <div class="stat-grid">
            <div class="stat-card"><span>Current BiteShards</span><strong>${game.state.tokens.BiteShard}</strong></div>
            <div class="stat-card"><span>Cycle</span><strong>${mining.active ? "Active" : "Idle"}</strong></div>
            <div class="stat-card"><span>Last Reward</span><strong>${mining.lastReward || 0}</strong></div>
          </div>
          <section class="panel-section">
            <div class="progress-shell"><div class="progress-bar" style="width:${progress}%"></div></div>
            <p class="hint">${progress}% complete</p>
          </section>
          <div class="panel-actions">
            <button class="purr-btn" data-start-mining ${mining.active ? "disabled" : ""}>Mine</button>
          </div>
        </article>
      `;
    }
  }

  P.BiteShardPanel = BiteShardPanel;
})(window.Purrdom);
