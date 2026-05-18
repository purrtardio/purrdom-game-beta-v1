import argparse
import json
from collections import deque
from pathlib import Path

from PIL import Image, ImageChops


DEFAULT_INPUT = Path("assets/source/water_tileset.png")
DEFAULT_OUTPUT = Path("assets/generated/terrain/water_tileset")
CELL_SIZE = (128, 96)
MIN_COMPONENT_AREA = 900


def is_background_pixel(pixel):
    r, g, b, a = pixel
    if a <= 10:
        return True
    if abs(r - g) <= 3 and abs(g - b) <= 3 and 210 <= r <= 255:
        return True
    return False


def make_subject_mask(image):
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    background = bytearray(width * height)
    queue = deque()

    def enqueue(x, y):
        index = y * width + x
        if background[index] or not is_background_pixel(pixels[x, y]):
            return
        background[index] = 1
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < width and 0 <= ny < height:
                enqueue(nx, ny)

    mask = bytearray(width * height)
    for y in range(height):
        for x in range(width):
            index = y * width + x
            if not background[index] and pixels[x, y][3] > 10:
                mask[index] = 1
    return mask, width, height


def connected_components(mask, width, height):
    seen = bytearray(width * height)
    components = []

    for y in range(height):
        for x in range(width):
            start = y * width + x
            if seen[start] or not mask[start]:
                continue

            seen[start] = 1
            queue = deque([(x, y)])
            min_x = max_x = x
            min_y = max_y = y
            area = 0

            while queue:
                cx, cy = queue.popleft()
                area += 1
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)

                for nx in range(cx - 1, cx + 2):
                    for ny in range(cy - 1, cy + 2):
                        if nx == cx and ny == cy:
                            continue
                        if nx < 0 or ny < 0 or nx >= width or ny >= height:
                            continue
                        index = ny * width + nx
                        if seen[index] or not mask[index]:
                            continue
                        seen[index] = 1
                        queue.append((nx, ny))

            if area >= MIN_COMPONENT_AREA:
                components.append({
                    "bbox": [min_x, min_y, max_x + 1, max_y + 1],
                    "area": area,
                    "center": [(min_x + max_x + 1) / 2, (min_y + max_y + 1) / 2],
                })

    return components


def row_major_components(components):
    rows = []
    for component in sorted(components, key=lambda item: item["center"][1]):
        placed = False
        for row in rows:
            row_center = sum(item["center"][1] for item in row) / len(row)
            if abs(component["center"][1] - row_center) <= 42:
                row.append(component)
                placed = True
                break
        if not placed:
            rows.append([component])

    ordered = []
    for row_index, row in enumerate(rows):
        row.sort(key=lambda item: item["center"][0])
        for col_index, component in enumerate(row):
            component["row"] = row_index
            component["col"] = col_index
            ordered.append(component)
    return ordered


def transparent_crop(image, bbox):
    crop = image.crop(bbox).convert("RGBA")
    alpha = crop.getchannel("A")
    return crop.crop(alpha.getbbox() or (0, 0, crop.width, crop.height))


def normalize_tile(crop):
    cell_w, cell_h = CELL_SIZE
    crop = crop.convert("RGBA")
    alpha = crop.getchannel("A")
    crop.putalpha(ImageChops.multiply(alpha, alpha.point(lambda value: 255 if value > 20 else 0)))

    max_w = cell_w - 8
    max_h = cell_h - 8
    scale = min(1, max_w / crop.width, max_h / crop.height)
    if scale < 1:
        crop = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.Resampling.LANCZOS)

    cell = Image.new("RGBA", CELL_SIZE, (0, 0, 0, 0))
    x = (cell_w - crop.width) // 2
    y = cell_h - crop.height - 4
    cell.alpha_composite(crop, (x, y))
    return cell


def classify_tile(index, component):
    row = component["row"]
    col = component["col"]
    if row == 0 and col <= 2:
        return f"open_{col + 1:02}"
    if row >= 4:
        return f"open_{index + 1:02}"
    if row == 3:
        return f"foam_{col + 1:02}"
    return f"shore_{index + 1:02}"


def slice_tileset(input_path, output_dir):
    source = Image.open(input_path).convert("RGBA")
    mask, width, height = make_subject_mask(source)
    components = row_major_components(connected_components(mask, width, height))
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest = []
    for index, component in enumerate(components):
        crop = transparent_crop(source, component["bbox"])
        normalized = normalize_tile(crop)
        slug = classify_tile(index, component)
        filename = f"water_{slug}.png"
        normalized.save(output_dir / filename)
        manifest.append({
            "file": filename,
            "slug": slug,
            "source_bbox": component["bbox"],
            "source_area": component["area"],
            "source_row": component["row"],
            "source_col": component["col"],
        })

    (output_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    return manifest


def main():
    parser = argparse.ArgumentParser(description="Slice and normalize an isometric water tileset sheet.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    if not args.input.exists():
        raise SystemExit(f"Missing source image: {args.input}")

    manifest = slice_tileset(args.input, args.output_dir)
    print(f"Wrote {len(manifest)} tiles to {args.output_dir}")


if __name__ == "__main__":
    main()
