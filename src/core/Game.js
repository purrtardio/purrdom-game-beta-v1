window.Purrdom = window.Purrdom || {};

(function defineGame(P) {
  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.assets = new P.AssetLoader();
      this.input = new P.InputManager(window);
      this.eventBus = new P.EventBus();
      this.state = JSON.parse(JSON.stringify(P.MockUser));
      this.effects = [];
      this.lastTime = 0;
      this.hudTimer = 0;
      this.running = false;
    }

    async start() {
      await this.assets.loadAll(P.AssetManifest);
      this.renderer = new P.Renderer(this.canvas, this.assets);
      this.player = new P.Player(P.MapData.spawn);
      this.camera = new P.Camera(this.renderer);
      this.loadMap("world", P.MapData.spawn);

      this.tooltip = new P.Tooltip(document.getElementById("tooltip"));
      this.dialogue = new P.DialogueSystem(document.getElementById("dialogue"));
      this.hud = new P.HUD(this, document.getElementById("hud"));
      this.panelManager = new P.PanelManager(this, document.getElementById("panel-root"));
      this.mobileControls = new P.MobileControls(this, document.getElementById("mobile-controls"));

      this.animation = new P.AnimationSystem(this);
      this.equipSystem = new P.EquipSystem(this);
      this.zoneSystem = new P.ZoneSystem(this);
      this.breedingPreviewSystem = new P.BreedingPreviewSystem(this);
      this.biteShardMiningSystem = new P.BiteShardMiningSystem(this);
      this.leaderboardSystem = new P.LeaderboardSystem(this);
      this.treasurySystem = new P.TreasurySystem(this);
      this.interactionSystem = new P.InteractionSystem(this);

      this.hud.render();
      this.dialogue.say("Welcome to Purrdom.");
      this.running = true;
      requestAnimationFrame((time) => this.loop(time));
    }

    computeCameraBounds() {
      const mapData = this.mapData || P.MapData;
      const points = [
        this.renderer.worldToScreen(0, 0),
        this.renderer.worldToScreen(mapData.width - 1, 0),
        this.renderer.worldToScreen(0, mapData.height - 1),
        this.renderer.worldToScreen(mapData.width - 1, mapData.height - 1)
      ];
      return {
        minX: Math.min(...points.map((point) => point.x)) - 280,
        maxX: Math.max(...points.map((point) => point.x)) + 280,
        minY: Math.min(...points.map((point) => point.y)) - 180,
        maxY: Math.max(...points.map((point) => point.y)) + 260
      };
    }

    loadMap(mapId, spawn) {
      if (mapId === "world") {
        this.currentMapId = "world";
        this.currentZoneId = null;
        this.mapData = P.MapData;
        this.world = new P.WorldMap();
      } else {
        const zoneData = P.ZoneMapData && P.ZoneMapData[mapId];
        if (!zoneData) return false;
        this.currentMapId = mapId;
        this.currentZoneId = mapId;
        this.mapData = zoneData;
        this.world = new P.ZoneMap(mapId);
      }

      this.renderer.setMapProjection(this.mapData);
      const nextSpawn = spawn || this.mapData.spawn;
      this.player.x = nextSpawn.x;
      this.player.y = nextSpawn.y;
      this.effects = [];
      this.camera.setBounds(this.computeCameraBounds());
      this.collisionMap = new P.CollisionMap(
        this.world.tileMap,
        this.world.entities.filter((entity) => entity.blocksMovement)
      );
      if (this.panelManager && this.panelManager.current) {
        this.panelManager.close();
      }
      if (this.tooltip) {
        this.tooltip.hide();
      }
      if (this.input) {
        this.input.clear();
      }
      return true;
    }

    enterZone(zoneId) {
      const zoneData = P.ZoneMapData && P.ZoneMapData[zoneId];
      if (!zoneData) return false;
      this.worldReturnSpawn = zoneData.returnSpawn || P.MapData.spawn;
      this.loadMap(zoneId, zoneData.spawn);
      const zone = P.ZONE_DATA.find((item) => item.id === zoneId);
      this.dialogue.say(`Entered ${zone ? zone.name : "zone"}.`);
      return true;
    }

    returnToWorld() {
      const spawn = this.worldReturnSpawn || P.MapData.spawn;
      this.loadMap("world", spawn);
      this.dialogue.say("Returned to Purrdom.");
    }

    loop(time) {
      if (!this.running) return;
      const dt = Math.min(0.05, (time - this.lastTime) / 1000 || 0);
      this.lastTime = time;
      this.update(dt);
      this.renderer.render(this);
      this.input.endFrame();
      requestAnimationFrame((nextTime) => this.loop(nextTime));
    }

    update(dt) {
      this.handleShortcuts();
      if (!this.panelManager.current) {
        this.player.update(dt, this.input, this.collisionMap);
      }
      this.camera.follow(this.player.x, this.player.y, dt);
      this.gainPassivePurrPoints(dt);
      this.interactionSystem.update();
      this.animation.update(dt);
      this.dialogue.update(dt);
      this.biteShardMiningSystem.update(dt);
      this.refreshHud(dt);
      this.refreshMiningPanel();
      this.mobileControls.update();
    }

    handleShortcuts() {
      if (this.input.consume("Escape")) {
        if (this.panelManager.current) {
          this.panelManager.close();
        }
        return;
      }
      if (this.input.consume("E")) {
        if (this.panelManager.current) {
          return;
        }
        this.interactionSystem.interact();
      }
      if (this.input.consume("Space")) {
        if (!this.panelManager.current) {
          this.interactionSystem.interact();
        }
      }
      if (this.input.consume("I")) this.panelManager.open("equipment");
      if (this.input.consume("M")) this.panelManager.open("overview");
      if (this.input.consume("L")) this.panelManager.open("leaderboard");
      if (this.input.consume("T")) this.panelManager.open("treasury");
      if (this.input.consume("B")) this.panelManager.open("biteshard");
      if (this.input.consume("R")) this.resetPlayer();
    }

    gainPassivePurrPoints(dt) {
      const gain = this.state.basePurrPointsRate * this.equipSystem.totalPurrPointMultiplier() * dt;
      this.state.purrPoints += gain;
    }

    refreshHud(dt) {
      this.hudTimer += dt;
      if (this.hudTimer >= 0.35) {
        this.hudTimer = 0;
        this.hud.render();
      }
    }

    refreshMiningPanel() {
      if (this.panelManager.current === "biteshard" && this.biteShardMiningSystem.active) {
        const now = performance.now();
        if (!this.lastMiningPanelRefresh || now - this.lastMiningPanelRefresh > 180) {
          this.lastMiningPanelRefresh = now;
          this.panelManager.open("biteshard");
        }
      }
    }

    resetPlayer() {
      const spawn = (this.mapData && this.mapData.spawn) || P.MapData.spawn;
      this.player.x = spawn.x;
      this.player.y = spawn.y;
      this.dialogue.say("Player position reset.");
    }
  }

  P.Game = Game;
})(window.Purrdom);
