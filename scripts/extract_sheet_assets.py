from pathlib import Path
from PIL import Image
import argparse
import hashlib
import re


ROOT = Path(__file__).resolve().parents[1]
SHEETS = ROOT / "assets" / "sheets"
OUT = ROOT / "assets" / "generated"
ASSET_JS = ROOT / "src" / "data" / "assets.js"

SHEET_FILES = {
    "terrain_a": "asset-sheet-6.png",
    "terrain_b": "asset-sheet-3.png",
    "props": "asset-sheet-5.png",
    "characters": "asset-sheet-2.png",
    "zones_a": "asset-sheet-4.png",
    "zones_b": "asset-sheet-1.png",
    "zone1": ROOT / "assets" / "zones" / "zone-assets-1.png",
    "zone2": ROOT / "assets" / "zones" / "zone-assets-2.png",
}


def read_manifest():
    text = ASSET_JS.read_text()
    groups = {}
    for match in re.finditer(r"(\w+):\s*\[(.*?)\]", text, re.S):
        category = match.group(1)
        files = re.findall(r'"([^"]+\.png)"', match.group(2))
        groups[category] = files
    return groups


def segment(path, threshold=248, min_area=80):
    image = Image.open(path).convert("RGBA")
    width, height = image.size
    pixels = image.load()
    mask = bytearray(width * height)
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 20 and not (r >= threshold and g >= threshold and b >= threshold):
                mask[y * width + x] = 1

    seen = bytearray(width * height)
    boxes = []
    for y in range(height):
        for x in range(width):
            idx = y * width + x
            if not mask[idx] or seen[idx]:
                continue
            queue = [(x, y)]
            seen[idx] = 1
            min_x = max_x = x
            min_y = max_y = y
            area = 0
            for qx, qy in queue:
                area += 1
                min_x = min(min_x, qx)
                max_x = max(max_x, qx)
                min_y = min(min_y, qy)
                max_y = max(max_y, qy)
                for ny in (qy - 1, qy, qy + 1):
                    for nx in (qx - 1, qx, qx + 1):
                        if nx < 0 or ny < 0 or nx >= width or ny >= height:
                            continue
                        ni = ny * width + nx
                        if mask[ni] and not seen[ni]:
                            seen[ni] = 1
                            queue.append((nx, ny))
            if area >= min_area and max_x - min_x > 6 and max_y - min_y > 6:
                boxes.append((min_x, min_y, max_x + 1, max_y + 1, area))

    boxes.sort(key=lambda box: (box[1] // 20, box[0]))
    return image, boxes


def transparent_crop(image, box, padding=8):
    x0, y0, x1, y1, _area = box
    x0 = max(0, x0 - padding)
    y0 = max(0, y0 - padding)
    x1 = min(image.width, x1 + padding)
    y1 = min(image.height, y1 + padding)
    crop = image.crop((x0, y0, x1, y1)).convert("RGBA")
    pix = crop.load()
    for y in range(crop.height):
        for x in range(crop.width):
            r, g, b, a = pix[x, y]
            if r > 246 and g > 246 and b > 246:
                pix[x, y] = (255, 255, 255, 0)
    return crop


def sheet_path_for(key):
    filename = SHEET_FILES.get(key)
    if filename is None and re.fullmatch(r"zone\d+", key):
        number = key.replace("zone", "")
        filename = ROOT / "assets" / "zones" / f"zone-assets-{number}.png"
    if filename is None:
        raise KeyError(f"Unknown source sheet key: {key}")
    return filename if isinstance(filename, Path) else SHEETS / filename


def load_components(required_sheets=None):
    components = {}
    sheet_keys = required_sheets or SHEET_FILES.keys()
    for key in sheet_keys:
        path = sheet_path_for(key)
        if not path.exists():
            raise FileNotFoundError(f"Missing sheet: {path}")
        image, boxes = segment(path)
        components[key] = (image, boxes)
    return components


def component(components, sheet, index):
    image, boxes = components[sheet]
    if not boxes:
        raise RuntimeError(f"No components found in {sheet}")
    return transparent_crop(image, boxes[index % len(boxes)])


def save_asset(category, filename, crop):
    out = OUT / category / filename
    out.parent.mkdir(parents=True, exist_ok=True)
    crop.save(out)


def file_digest(path):
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def snapshot_generated(excluded_category=None):
    snapshot = {}
    if not OUT.exists():
        return snapshot
    excluded_root = OUT / excluded_category if excluded_category else None
    for path in OUT.rglob("*"):
        if not path.is_file():
            continue
        if excluded_root and (path == excluded_root or excluded_root in path.parents):
            continue
        snapshot[path.relative_to(OUT).as_posix()] = file_digest(path)
    return snapshot


def changed_paths(before, after):
    changed = []
    for path in sorted(set(before) | set(after)):
        if before.get(path) != after.get(path):
            changed.append(path)
    return changed


def choice_for(category, filename, offset):
    name = filename.replace(".png", "")

    terrain_indices = {
        "terrain_grass_iso_01": 0,
        "terrain_royal_grass_iso_01": 2,
        "terrain_river_magic_01": 31,
        "terrain_water_iso_01": 32,
        "terrain_water_iso_02": 33,
        "terrain_water_iso_03": 39,
        "terrain_canal_glowing_01": 38,
        "terrain_marble_plaza": 56,
        "terrain_stone_platform": 58,
        "terrain_crystal_platform": 61,
        "terrain_dark_arena_floor": 24,
        "terrain_royal_path_tile": 56,
        "terrain_rune_decal_neon": 117,
        "terrain_ground_stones": 46,
        "terrain_grass_tufts": 136,
        "terrain_paw_print_decal": 111,
        "terrain_hyper_accent_tile": 45,
    }
    if category == "terrain":
        if name in terrain_indices:
            return ("terrain_a", terrain_indices[name])
        if "shoreline" in name:
            return ("terrain_a", 33 + offset)
        if "island_edge" in name:
            return ("terrain_a", 15 + offset)
        if "grass_edge" in name:
            return ("terrain_a", 50 + offset)
        return ("terrain_a", offset)

    path_indices = {
        "path_royal_center": 56,
        "path_iso_horizontal": 57,
        "path_iso_vertical": 58,
        "path_corner": 59,
        "path_t_junction": 60,
        "path_crossroad": 56,
        "path_end_cap": 55,
        "path_plaza_border": 86,
        "path_bridge_connection": 70,
        "path_trim_blue": 61,
        "path_trim_purple": 24,
        "path_portal_landing": 82,
    }
    if category == "paths":
        return ("terrain_a", path_indices.get(name, 64 + offset))

    bridge_indices = {
        "bridge_wood_segment": 67,
        "bridge_stone_magic": 70,
        "bridge_rune_glowing": 71,
        "bridge_start_piece": 68,
        "bridge_end_piece": 69,
        "bridge_posts": 78,
        "bridge_canal_arch": 72,
        "bridge_dock_tile": 74,
        "bridge_dock_corner": 76,
        "bridge_fantasy_boat": 84,
        "bridge_airship_dock": 77,
    }
    if category == "bridges":
        return ("terrain_a", bridge_indices.get(name, 102 + offset))

    zone_indices = {
        "zone_hyperevm_nexus": 0,
        "zone_fate_arena": 1,
        "zone_perps_arena": 2,
        "zone_lending_halls": 3,
        "zone_liquidity_dens": 4,
        "zone_vault_stronghold": 5,
        "zone_drip_marketplace": 6,
        "zone_mystery_locked_island": 12,
        "zone_fog_portal": 9,
        "zone_hidden_forest_gate": 83,
        "zone_sealed_rune_door": 84,
        "zone_crystal_cave_entrance": 8,
        "zone_dark_tower_silhouette": 22,
        "zone_coming_soon_shrine": 23,
        "zone_unknown_protocol_gate": 148,
    }
    if category == "zones":
        return ("zones_a", zone_indices.get(name, offset))

    building_indices = {
        "building_purrdom_castle": 3,
        "building_royal_cat_palace": 3,
        "building_treasury_tower": 14,
        "building_leaderboard_tower": 28,
        "building_airdrop_shrine": 9,
        "building_mystery_pack_shop": 11,
        "building_common_pack_kiosk": 31,
        "building_summoning_portal": 7,
        "building_purrling_nursery": 10,
        "building_equipment_forge": 30,
        "building_marketplace_booth": 6,
        "building_small_cat_house": 29,
        "building_cozy_kingdom_building": 32,
        "building_magical_shop": 12,
        "building_signpost": 72,
        "building_notice_board": 34,
        "building_mailbox": 76,
        "building_token_vault_chest": 61,
        "building_multisig_vault_monument": 21,
    }
    if category == "buildings":
        return ("zones_a", building_indices.get(name, 29 + offset))

    prop_indices = {
        "defi_staking_shrine": ("zones_a", 23),
        "defi_yield_pedestal": ("zones_a", 16),
        "defi_apy_signboard": ("zones_a", 28),
        "defi_reward_chest": ("zones_a", 61),
        "defi_liquidity_pool_altar": ("zones_a", 4),
        "defi_trading_terminal": ("zones_a", 27),
        "defi_vault_console": ("zones_a", 21),
        "defi_lending_desk": ("zones_a", 3),
        "defi_marketplace_kiosk": ("zones_a", 33),
        "defi_protocol_monument": ("zones_a", 24),
        "defi_activity_beacon": ("zones_a", 18),
        "defi_reward_claim_crystal": ("zones_a", 82),
        "defi_purr_points_fountain": ("zones_a", 94),
        "defi_zone_boost_crystal": ("zones_a", 47),
        "defi_transaction_altar": ("zones_a", 15),
        "prop_fence": ("props", 118),
        "prop_gate": ("props", 95),
        "prop_barrel": ("props", 132),
        "prop_crate": ("props", 141),
        "prop_token_crate": ("props", 137),
        "prop_scroll_stack": ("zones_a", 116),
        "prop_lantern_glowing": ("zones_a", 77),
        "prop_bench": ("props", 161),
        "prop_flower_pot": ("props", 27),
        "prop_mushroom_magic": ("props", 40),
        "prop_bush": ("props", 21),
        "prop_flowering_bush": ("props", 28),
        "prop_round_tree": ("props", 2),
        "prop_crystal_tree": ("props", 33),
        "prop_cat_statue": ("zones_a", 89),
        "prop_fountain": ("zones_a", 94),
        "prop_banner": ("zones_a", 36),
        "prop_flag": ("zones_a", 42),
        "prop_rug": ("zones_a", 44),
        "prop_treasure_chest": ("zones_a", 61),
        "prop_glowing_crystal": ("zones_a", 47),
        "prop_rune_stone": ("props", 121),
        "prop_bridge_lamp": ("props", 95),
        "prop_canal_stone": ("props", 47),
        "prop_paw_print": ("characters", 110),
        "prop_defi_kiosk": ("zones_a", 33),
        "prop_magic_terminal": ("zones_a", 24),
        "biteshard_mining_cave": ("zones_a", 8),
        "biteshard_crystal_node": ("characters", 86),
        "biteshard_shard_icon": ("characters", 85),
        "biteshard_progress_bar": ("zones_a", 28),
        "biteshard_sparkle_01": ("characters", 100),
        "biteshard_sparkle_02": ("characters", 101),
        "biteshard_sparkle_03": ("characters", 103),
        "biteshard_mining_pedestal": ("characters", 84),
        "biteshard_machine_idle": ("zones_a", 21),
        "biteshard_machine_active": ("zones_a", 16),
        "purrling_companion_shadow": ("characters", 64),
    }
    if category == "props":
        return prop_indices.get(name, ("props", offset))

    token_indices = {
        "token_purrls": 106,
        "token_hyperals": 107,
        "token_claw": 108,
        "token_whisk": 109,
        "token_paw": 110,
        "token_spark": 111,
        "token_guard": 112,
        "token_biteshard": 85,
        "token_purr_points": 87,
        "token_common_pack": 69,
        "token_mystery_pack": 72,
        "token_legendary_power_sock_badge": 64,
        "biteshard_shard_icon": 85,
    }
    if category == "tokens":
        return ("characters", token_indices.get(name, 106 + offset))

    if category == "purrlings":
        if "idle_down" in name:
            return ("characters", 17)
        if "idle_up" in name:
            return ("characters", 18)
        if "idle_left" in name:
            return ("characters", 19)
        if "idle_right" in name:
            return ("characters", 29)
        if "walk" in name:
            return ("characters", [29, 30, 31, 36, 37, 38, 40, 41, 42, 43, 44, 45][offset % 12])
        variants = {
            "purrling_female_variant": 18,
            "purrling_common_variant": 29,
            "purrling_rare_variant": 22,
            "purrling_legendary_variant": 25,
            "purrling_expression_happy": 47,
            "purrling_expression_sleepy": 57,
            "purrling_expression_mystic": 24,
        }
        return ("characters", variants.get(name, 29))

    if category == "equipment":
        equipment_indices = {
            "equipment_power_sock_icon": 62,
            "equipment_power_sock_glow": 58,
            "equipment_power_sock_inventory_card": 64,
            "equipment_power_sock_badge": 64,
            "equipment_power_sock_shrine": 59,
        }
        return ("characters", equipment_indices.get(name, 62))

    if category == "ui":
        ui_indices = {
            "ui_panel_hud": ("zones_a", 27),
            "ui_inventory_slot": ("characters", 69),
            "ui_purrling_slot": ("characters", 64),
            "ui_power_sock_slot": ("characters", 62),
            "ui_token_counter_frame": ("characters", 106),
            "ui_purr_points_counter_frame": ("characters", 87),
            "ui_panel_zone": ("zones_a", 28),
            "ui_panel_equipment": ("zones_a", 21),
            "ui_panel_breeding": ("zones_a", 7),
            "ui_panel_biteshard": ("zones_a", 8),
            "ui_panel_leaderboard": ("zones_a", 27),
            "ui_panel_treasury": ("zones_a", 21),
            "ui_panel_airdrop": ("zones_a", 9),
            "ui_panel_mystery_pack": ("characters", 72),
            "ui_tooltip_box": ("zones_a", 34),
            "ui_dialogue_box": ("zones_a", 28),
            "ui_button_normal": ("characters", 106),
            "ui_button_hover": ("characters", 107),
            "ui_button_pressed": ("characters", 108),
            "ui_close_button": ("characters", 109),
            "ui_tab_button": ("characters", 110),
            "ui_apy_badge": ("zones_a", 28),
            "ui_boost_badge": ("characters", 111),
            "ui_og_badge": ("characters", 64),
            "ui_progress_bar": ("zones_a", 28),
            "ui_button_open_zone": ("characters", 107),
            "ui_button_claim_rewards": ("characters", 87),
            "ui_button_equip": ("characters", 62),
            "ui_button_preview_breed": ("zones_a", 7),
            "ui_button_mine": ("characters", 85),
            "ui_button_open_pack": ("characters", 72),
            "biteshard_progress_bar": ("zones_a", 28),
        }
        return ui_indices.get(name, ("zones_a", offset))

    zone1_indices = {
        "zone1_arena_colosseum": 0,
        "zone1_blue_hall": 1,
        "zone1_ranking_board": 2,
        "zone1_gate_arch": 3,
        "zone1_arena_ring": 4,
        "zone1_watchtower_small": 5,
        "zone1_dock_tower": 7,
        "zone1_prize_chest_stall": 9,
        "zone1_market_stall": 10,
        "zone1_target_stand": 11,
        "zone1_curved_wall": 12,
        "zone1_banner_wall": 13,
        "zone1_wall_segment": 14,
        "zone1_stair_red": 15,
        "zone1_stair_light": 16,
        "zone1_stair_stone": 17,
        "zone1_arch_open": 18,
        "zone1_arch_gate": 19,
        "zone1_notice_board": 20,
        "zone1_arched_bridge": 25,
        "zone1_fence_green": 26,
        "zone1_stone_pillar": 31,
        "zone1_rope_posts_gold": 32,
        "zone1_red_paw_banner": 33,
        "zone1_blue_sword_banner": 34,
        "zone1_blue_floor_lamp": 35,
        "zone1_blue_lamp": 36,
        "zone1_purple_lamp": 37,
        "zone1_flag_pair": 38,
        "zone1_red_hanging_banner": 39,
        "zone1_blue_hanging_banner": 40,
        "zone1_red_flag": 41,
        "zone1_red_brazier": 42,
        "zone1_tall_brazier": 43,
        "zone1_gold_lamp": 44,
        "zone1_purple_lamp_small": 45,
        "zone1_blue_lamp_small": 46,
        "zone1_signpost": 47,
        "zone1_quest_board": 48,
        "zone1_chalkboard": 49,
        "zone1_round_paw_tile": 50,
        "zone1_curved_floor_large": 51,
        "zone1_curved_floor_small": 52,
        "zone1_stone_tile_gold": 53,
        "zone1_round_stone_tile": 54,
        "zone1_white_stone_tile": 55,
        "zone1_grass_stone_tile": 56,
        "zone1_grass_stone_tile_large": 57,
        "zone1_grass_stone_tile_small": 58,
        "zone1_dirt_tile": 59,
        "zone1_grass_block": 60,
        "zone1_dirt_grass_block": 61,
        "zone1_raised_grass_block": 62,
        "zone1_leafy_grass_block": 63,
        "zone1_sand_water_block": 64,
        "zone1_battle_rules_board": 78,
        "zone1_leaderboard_empty": 79,
        "zone1_blue_score_board": 80,
        "zone1_practice_dummy_blue": 81,
        "zone1_practice_dummy_brown": 82,
        "zone1_target_red": 83,
        "zone1_target_red_alt": 84,
        "zone1_barrel_crate": 85,
        "zone1_barrel": 86,
        "zone1_coin_bag": 87,
        "zone1_bench": 88,
        "zone1_crystal_crate": 89,
        "zone1_silver_cat_statue": 90,
        "zone1_gold_cat_statue": 91,
        "zone1_green_cat_statue": 92,
        "zone1_blue_cat_statue": 93,
        "zone1_reward_chest": 94,
        "zone1_purple_reward_chest": 95,
        "zone1_trophy": 96,
        "zone1_paw_coin": 97,
        "zone1_red_medal": 98,
        "zone1_blue_medal": 99,
        "zone1_potted_palm": 104,
        "zone1_potted_leaf": 105,
        "zone1_palm_tree": 106,
        "zone1_palm_tree_alt": 107,
        "zone1_pine_tree": 108,
        "zone1_pink_tree": 109,
        "zone1_shrub": 110,
        "zone1_potted_yucca": 111,
        "zone1_flower_bush": 112,
        "zone1_flowers_orange": 113,
        "zone1_white_flowers": 114,
        "zone1_pink_flower_bush": 115,
        "zone1_rock_cluster": 116,
        "zone1_blue_flower": 117,
        "zone1_pink_plant": 118,
        "zone1_grass_tuft": 119,
        "zone1_blue_mushrooms": 120,
        "zone1_red_mushrooms": 121,
        "zone1_npc_king_front": 122,
        "zone1_npc_orange_guard_side": 123,
        "zone1_npc_orange_guard_back": 124,
        "zone1_npc_black_guard_front": 125,
        "zone1_npc_black_guard_side": 126,
        "zone1_npc_black_guard_back": 127,
        "zone1_npc_adventurer_front": 128,
        "zone1_npc_ranger_front": 129,
        "zone1_npc_ranger_side": 130,
        "zone1_npc_orange_cat_front": 131,
        "zone1_npc_orange_cat_side": 132,
        "zone1_npc_orange_cat_back": 133,
        "zone1_npc_orange_cat_back_alt": 134,
        "zone1_npc_king_front_alt": 135,
        "zone1_npc_orange_guard_side_alt": 136,
        "zone1_npc_orange_guard_back_alt": 137,
        "zone1_npc_black_guard_front_alt": 138,
        "zone1_npc_black_guard_side_alt": 139,
        "zone1_npc_black_guard_back_alt": 140,
        "zone1_npc_adventurer_front_alt": 141,
        "zone1_npc_ranger_front_alt": 142,
        "zone1_npc_ranger_side_alt": 143,
        "zone1_npc_orange_cat_front_alt": 144,
        "zone1_npc_orange_cat_side_alt": 145,
        "zone1_npc_orange_cat_back_alt_2": 146,
        "zone1_npc_orange_cat_back_plain": 147,
    }
    if category == "zone1":
        return ("zone1", zone1_indices.get(name, offset))

    zone2_indices = {
        "zone2_lending_halls": 0,
        "zone2_vault_annex": 1,
        "zone2_lending_kiosk": 2,
        "zone2_crystal_fountain": 3,
        "zone2_trust_cat_statue": 4,
        "zone2_deposit_supply_desk": 5,
        "zone2_top_lenders_board": 6,
        "zone2_borrow_lend_desk": 7,
        "zone2_stone_bridge": 8,
        "zone2_water_stairs": 9,
        "zone2_arch_gate": 10,
        "zone2_wall_post": 11,
        "zone2_lamp_tall": 12,
        "zone2_blue_banner": 13,
        "zone2_wall_segment": 14,
        "zone2_lantern_post": 16,
        "zone2_rope_posts": 17,
        "zone2_gold_stanchions": 18,
        "zone2_rope_post": 19,
        "zone2_round_plaza": 20,
        "zone2_plaza_tile": 21,
        "zone2_ornate_tile": 22,
        "zone2_stone_path_tile": 23,
        "zone2_moss_path_tile": 24,
        "zone2_grass_tile": 25,
        "zone2_flower_tile": 26,
        "zone2_water_tile": 27,
        "zone2_waterfall_tile": 28,
        "zone2_canal_tile": 29,
        "zone2_waterfall_edge": 30,
        "zone2_flower_rocks": 31,
        "zone2_planter_flowers": 32,
        "zone2_palm_tree": 33,
        "zone2_flower_arch": 34,
        "zone2_pine_tree": 35,
        "zone2_flower_box": 36,
        "zone2_potted_palm": 37,
        "zone2_palm_tree_large": 38,
        "zone2_yellow_flowers": 39,
        "zone2_wildflowers": 40,
        "zone2_green_shoots": 41,
        "zone2_sprout": 42,
        "zone2_potted_flowers": 43,
        "zone2_rock_garden": 44,
        "zone2_rock_cluster": 45,
        "zone2_rock_pile": 46,
        "zone2_small_rocks": 47,
        "zone2_bench": 48,
        "zone2_crate": 49,
        "zone2_barrel": 50,
        "zone2_barrel_round": 51,
        "zone2_coin_bag": 52,
        "zone2_treasure_chest": 53,
        "zone2_ledger_book": 54,
        "zone2_crystal_small": 55,
        "zone2_crystal_cluster": 56,
        "zone2_crystal_shard": 57,
        "zone2_crystal_node": 58,
        "zone2_vault_safe": 59,
        "zone2_purr_points_marker": 60,
        "zone2_lamp_base": 61,
        "zone2_open_ledger": 62,
        "zone2_scroll": 63,
        "zone2_banner_stand": 64,
        "zone2_notice_board": 65,
        "zone2_signpost": 66,
        "zone2_hanging_lantern": 67,
        "zone2_blue_brazier": 68,
        "zone2_column": 69,
        "zone2_market_stall": 70,
        "zone2_lamp_small": 71,
        "zone2_fire_brazier": 72,
        "zone2_fountain_bowl": 73,
        "zone2_ornate_fountain": 74,
        "zone2_floor_banner": 75,
        "zone2_rope_barrier": 76,
        "zone2_beacon": 77,
        "zone2_npc_clerk_front": 78,
        "zone2_npc_clerk_side": 79,
        "zone2_npc_clerk_back": 80,
        "zone2_npc_gray_lender_front": 81,
        "zone2_npc_gray_lender_side": 82,
        "zone2_npc_guard_front": 83,
        "zone2_npc_guard_side": 84,
        "zone2_npc_blue_lender_front": 99,
        "zone2_npc_blue_lender_side": 100,
        "zone2_npc_courier_front": 106,
        "zone2_npc_crystal_holder": 115,
    }
    if category == "zone2":
        return ("zone2", zone2_indices.get(name, offset))

    return ("props", offset)


def extract_categories(groups, categories):
    components = {}
    total = 0
    for category in categories:
        files = groups[category]
        for offset, filename in enumerate(files):
            sheet, index = choice_for(category, filename, offset)
            if sheet not in components:
                components.update(load_components([sheet]))
            save_asset(category, filename, component(components, sheet, index))
            total += 1
    return total


def extract_all(groups):
    total = extract_categories(groups, groups.keys())
    legacy_sheet_outputs = [
        ("props", "purrling_companion_shadow.png", "characters", 64),
        ("tokens", "biteshard_shard_icon.png", "characters", 85),
        ("ui", "biteshard_progress_bar.png", "zones_a", 28),
        ("zones", "biteshard_mining_cave.png", "zones_a", 8),
    ]
    components = {}
    for category, filename, sheet, index in legacy_sheet_outputs:
        if sheet not in components:
            components.update(load_components([sheet]))
        save_asset(category, filename, component(components, sheet, index))
    return total


def extract_zone(groups, zone_number):
    category = f"zone{zone_number}"
    if category not in groups:
        raise ValueError(f"Missing {category} group in {ASSET_JS}")

    before = snapshot_generated(excluded_category=category)
    total = extract_categories(groups, [category])
    after = snapshot_generated(excluded_category=category)
    changed = changed_paths(before, after)
    if changed:
        sample = ", ".join(changed[:8])
        raise RuntimeError(f"Zone extraction touched non-{category} assets: {sample}")
    return total


def parse_args():
    parser = argparse.ArgumentParser(
        description="Extract runtime assets from source sheets. Use --zone N for isolated zone work."
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--all", action="store_true", help="Regenerate every asset group.")
    mode.add_argument("--zone", type=int, help="Regenerate only assets/generated/zoneN from assets/zones/zone-assets-N.png.")
    return parser.parse_args()


def main():
    args = parse_args()
    groups = read_manifest()
    if args.zone is not None:
        total = extract_zone(groups, args.zone)
        print(f"Extracted {total} zone{args.zone} assets into {OUT / f'zone{args.zone}'}")
        return

    total = extract_all(groups)
    print(f"Extracted {total} runtime assets from source sheets into {OUT}")


if __name__ == "__main__":
    main()
