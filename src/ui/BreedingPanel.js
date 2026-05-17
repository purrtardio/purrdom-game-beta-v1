window.Purrdom = window.Purrdom || {};

(function defineBreedingPanel(P) {
  class BreedingPanel {
    static render(game) {
      const preview = game.breedingPreviewSystem.preview();
      return `
        <article class="panel">
          <header class="panel-header">
            <div>
              <div class="panel-eyebrow">Royal Summoning Portal</div>
              <h2>Breeding Preview</h2>
              <p>${preview.notice}</p>
            </div>
            <button class="close-btn" data-close-panel aria-label="Close">x</button>
          </header>
          <div class="stat-grid">
            <div class="stat-card"><span>Selected Purrling A</span><strong>${preview.purrlingA.name}</strong><p>${preview.purrlingA.type}</p></div>
            <div class="stat-card"><span>Selected Purrling B</span><strong>${preview.purrlingB}</strong></div>
            <div class="stat-card"><span>Breeding Cost</span><strong>${preview.cost}</strong></div>
            <div class="stat-card"><span>Base Mutation Chance</span><strong>${preview.baseMutationChance}%</strong></div>
            <div class="stat-card"><span>Power Sock Bonus</span><strong>+${preview.powerSockBonus}%</strong></div>
            <div class="stat-card"><span>Final Mutation Chance</span><strong>${preview.finalMutationChance}%</strong></div>
          </div>
          <div class="panel-actions">
            <button class="purr-btn secondary">Preview Breed</button>
          </div>
        </article>
      `;
    }
  }

  P.BreedingPanel = BreedingPanel;
})(window.Purrdom);
