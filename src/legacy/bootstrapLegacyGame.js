import "../data/assets.js";
import "../data/tokens.js";
import "../data/items.js";
import "../data/purrlings.js";
import "../data/zones.js";
import "../data/mockUser.js";
import "../data/leaderboard.js";
import "../data/treasury.js";

import "../core/EventBus.js";
import "../core/AssetLoader.js";
import "../core/InputManager.js";
import "../core/Camera.js";
import "../core/CollisionMap.js";
import "../core/Renderer.js";

import "../world/MapData.js";
import "../world/Zones.js";
import "../world/ZoneMapData.js";
import "../world/TileMap.js";
import "../world/WorldMap.js";
import "../world/ZoneMap.js";

import "../entities/Entity.js";
import "../entities/Player.js";
import "../entities/Purrling.js";
import "../entities/NPC.js";
import "../entities/ZonePortal.js";
import "../entities/DeFiNode.js";
import "../entities/BiteShardNode.js";
import "../entities/DecorativeEntity.js";

import "../systems/AnimationSystem.js";
import "../systems/DialogueSystem.js";
import "../systems/EquipSystem.js";
import "../systems/ZoneSystem.js";
import "../systems/BreedingPreviewSystem.js";
import "../systems/BiteShardMiningSystem.js";
import "../systems/LeaderboardSystem.js";
import "../systems/TreasurySystem.js";
import "../systems/InteractionSystem.js";

import "../ui/Tooltip.js";
import "../ui/HUD.js";
import "../ui/PanelManager.js";
import "../ui/MobileControls.js";
import "../ui/ZonePanel.js";
import "../ui/EquipPanel.js";
import "../ui/BreedingPanel.js";
import "../ui/BiteShardPanel.js";
import "../ui/LeaderboardPanel.js";
import "../ui/TreasuryPanel.js";
import "../ui/AirdropPanel.js";
import "../ui/MysteryPackPanel.js";

import "../core/Game.js";

let gamePromise = null;

export function bootstrapLegacyGame() {
  if (gamePromise) return gamePromise;
  gamePromise = new Promise((resolve, reject) => {
    const start = () => {
      try {
        if (window.Purrdom && window.Purrdom.game) {
          resolve(window.Purrdom.game);
          return;
        }

        const canvas = document.getElementById("gameCanvas");
        const dialogue = document.getElementById("dialogue");
        const game = new window.Purrdom.Game(canvas);
        window.Purrdom.game = game;
        game.start()
          .then(() => {
            window.dispatchEvent(new CustomEvent("purrdom:game-ready", { detail: { game } }));
            resolve(game);
          })
          .catch((error) => {
            console.error(error);
            if (dialogue) {
              dialogue.textContent = `Purrdom failed to start: ${error.message}`;
              dialogue.classList.remove("hidden");
            }
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    };

    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }
  });
  return gamePromise;
}
