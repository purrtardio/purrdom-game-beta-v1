window.Purrdom = window.Purrdom || {};

(function defineMapData(P) {
  const width = 41;
  const height = 29;
  const landTiles = new Set();
  const canalTiles = new Set();
  const bridgeTiles = new Set();
  const pathTiles = new Map();
  const platformTiles = new Map();

  function key(x, y) {
    return `${x},${y}`;
  }

  function add(set, x, y) {
    if (x >= 0 && y >= 0 && x < width && y < height) {
      set.add(key(x, y));
    }
  }

  function setTile(map, x, y, asset) {
    if (x >= 0 && y >= 0 && x < width && y < height) {
      map.set(key(x, y), asset);
    }
  }

  function lineEach(x1, y1, x2, y2, visit) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= steps; i += 1) {
      const x = Math.round(x1 + ((x2 - x1) * i) / steps);
      const y = Math.round(y1 + ((y2 - y1) * i) / steps);
      visit(x, y, i);
    }
  }

  function pathLine(x1, y1, x2, y2, asset = "path_royal_center") {
    lineEach(x1, y1, x2, y2, (x, y) => setTile(pathTiles, x, y, asset));
  }

  function canalLine(x1, y1, x2, y2) {
    lineEach(x1, y1, x2, y2, (x, y) => add(canalTiles, x, y));
  }

  function bridge(x, y) {
    add(bridgeTiles, x, y);
    add(bridgeTiles, x + 1, y);
  }

  function platform(cx, cy, rx, ry, asset) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) {
          setTile(platformTiles, x, y, asset);
          landTiles.add(key(x, y));
        }
      }
    }
  }

  function insideAnyIsland(x, y) {
    const blobs = [
      [20, 15, 15.5, 8.8],
      [10, 7, 7.5, 5.4],
      [29, 7, 7.5, 5.2],
      [35, 8, 4.9, 4.3],
      [7, 15, 6.5, 5.4],
      [33, 15, 6.2, 5.2],
      [11, 22, 7.5, 4.7],
      [20, 23, 7.5, 4.5],
      [28, 22, 8.2, 5.1],
      [4, 24, 4.2, 3.3],
      [37, 24, 3.8, 3.2],
      [3, 14, 3.1, 2.8],
      [38, 14, 3.1, 2.8]
    ];
    return blobs.some(([cx, cy, rx, ry]) => {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      return dx * dx + dy * dy <= 1;
    });
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (insideAnyIsland(x, y)) {
        landTiles.add(key(x, y));
      }
    }
  }

  // Canals split the kingdom into readable DeFi districts without turning it into a farm grid.
  canalLine(13, 5, 13, 9);
  canalLine(13, 9, 10, 12);
  canalLine(27, 5, 28, 9);
  canalLine(28, 9, 31, 12);
  canalLine(7, 19, 13, 20);
  canalLine(27, 20, 34, 19);

  // Main civic plaza and district platforms.
  platform(20, 15, 4.4, 3.2, "terrain_marble_plaza");
  platform(10, 7, 3.8, 2.7, "terrain_dark_arena_floor");
  platform(28, 7, 3.6, 2.4, "terrain_marble_plaza");
  platform(35, 8, 3.2, 2.2, "terrain_crystal_platform");
  platform(7, 15, 3.8, 2.6, "terrain_canal_glowing_01");
  platform(32, 15, 3.8, 2.7, "terrain_stone_platform");
  platform(11, 21, 3.7, 2.6, "terrain_royal_path_tile");
  platform(29, 22, 3.6, 2.5, "terrain_dark_arena_floor");
  platform(20, 23, 3.8, 2.4, "terrain_marble_plaza");

  // Roads radiate from the castle like a dashboard navigation graph.
  pathLine(20, 15, 16, 12);
  pathLine(16, 12, 10, 8);
  pathLine(20, 14, 24, 11);
  pathLine(24, 11, 28, 8);
  pathLine(28, 8, 35, 8, "path_trim_blue");
  pathLine(20, 16, 14, 16, "path_iso_horizontal");
  pathLine(14, 16, 7, 15, "path_iso_horizontal");
  pathLine(21, 16, 27, 16, "path_iso_horizontal");
  pathLine(27, 16, 32, 15, "path_iso_horizontal");
  pathLine(19, 18, 15, 20, "path_trim_purple");
  pathLine(15, 20, 11, 21, "path_trim_purple");
  pathLine(21, 18, 25, 20, "path_trim_blue");
  pathLine(25, 20, 29, 22, "path_trim_blue");
  pathLine(20, 18, 20, 23, "path_iso_vertical");
  pathLine(20, 19, 16, 21, "path_corner");
  pathLine(16, 21, 14, 22, "path_corner");
  pathLine(17, 17, 4, 24, "path_trim_blue");
  pathLine(24, 17, 37, 24, "path_trim_purple");

  // Bridges are where the route graph crosses canals.
  [
    [13, 10],
    [27, 10],
    [10, 20],
    [28, 20],
    [34, 19],
    [5, 22],
    [35, 22]
  ].forEach(([x, y]) => bridge(x, y));

  function isLand(x, y) {
    return landTiles.has(key(x, y));
  }

  function touchesWater(x, y) {
    for (let yy = y - 1; yy <= y + 1; yy += 1) {
      for (let xx = x - 1; xx <= x + 1; xx += 1) {
        if (xx === x && yy === y) continue;
        if (!isLand(xx, yy) || canalTiles.has(key(xx, yy))) {
          return true;
        }
      }
    }
    return false;
  }

  P.MapData = {
    width,
    height,
    projection: { tileWidth: 78, tileHeight: 28 },
    spawn: { x: 17.4, y: 18.2 },
    key,
    terrainAt(x, y) {
      const tileKey = key(x, y);
      if (bridgeTiles.has(tileKey)) {
        return { asset: "bridge_stone_magic", walkable: true, type: "bridge" };
      }
      if (!landTiles.has(tileKey)) {
        return { asset: (x + y) % 3 === 0 ? "terrain_water_iso_02" : "terrain_water_iso_01", walkable: false, type: "water" };
      }
      if (canalTiles.has(tileKey)) {
        return { asset: "terrain_river_magic_01", walkable: false, type: "canal" };
      }
      if (platformTiles.has(tileKey)) {
        return { asset: platformTiles.get(tileKey), walkable: true, type: "platform" };
      }
      if (pathTiles.has(tileKey)) {
        return { asset: pathTiles.get(tileKey), walkable: true, type: "path" };
      }
      if (touchesWater(x, y)) {
        return { asset: "terrain_shoreline_n", walkable: true, type: "shore" };
      }
      if ((x + y) % 13 === 0) {
        return { asset: "terrain_hyper_accent_tile", walkable: true, type: "grass" };
      }
      if ((x * 7 + y * 5) % 23 === 0) {
        return { asset: "terrain_paw_print_decal", walkable: true, type: "grass" };
      }
      if ((x * 3 + y) % 19 === 0) {
        return { asset: "terrain_grass_tufts", walkable: true, type: "grass" };
      }
      return { asset: "terrain_grass_iso_01", walkable: true, type: "grass" };
    }
  };
})(window.Purrdom);
