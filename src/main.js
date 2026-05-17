window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const game = new window.Purrdom.Game(canvas);
  window.Purrdom.game = game;
  game.start().catch((error) => {
    console.error(error);
    const dialogue = document.getElementById("dialogue");
    dialogue.textContent = `Purrdom failed to start: ${error.message}`;
    dialogue.classList.remove("hidden");
  });
});
