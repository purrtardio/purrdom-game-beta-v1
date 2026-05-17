from pathlib import Path
from random import Random

from PIL import Image, ImageDraw


OUT_DIR = Path("assets/generated/terrain")
SIZE = (96, 56)
DIAMOND = [(48, 6), (91, 24), (48, 43), (5, 24)]


def mix(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_tile(index, base, deep, light):
    rng = Random(1700 + index)
    mask = Image.new("L", SIZE, 0)
    ImageDraw.Draw(mask).polygon(DIAMOND, fill=255)

    image = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    pixels = image.load()
    mask_pixels = mask.load()

    for y in range(SIZE[1]):
      for x in range(SIZE[0]):
        if not mask_pixels[x, y]:
          continue
        vertical = max(0, min(1, (y - 6) / 38))
        ripple = ((x * 7 + y * 5 + index * 13) % 23) / 22
        color = mix(light, deep, vertical * 0.5 + ripple * 0.05)
        if (x + y + index) % 13 == 0:
          color = mix(color, (218, 253, 255), 0.12)
        elif (x * 3 + y + index) % 17 == 0:
          color = mix(color, base, 0.12)
        pixels[x, y] = (*color, 255)

    draw = ImageDraw.Draw(image)
    for _ in range(12):
      x = rng.randint(14, 72)
      y = rng.randint(13, 34)
      if not mask_pixels[x, y]:
        continue
      width = rng.choice([8, 10, 12, 14])
      color = (*mix(light, (244, 255, 255), rng.uniform(0.2, 0.5)), rng.randint(58, 104))
      draw.line([(x, y), (x + width // 2, y - 2), (x + width, y)], fill=color, width=1)

    for _ in range(8):
      x = rng.randint(13, 78)
      y = rng.randint(15, 36)
      if mask_pixels[x, y]:
        draw.point((x, y), fill=(224, 255, 255, rng.randint(100, 160)))
        if rng.random() > 0.45:
          draw.point((x + 1, y), fill=(139, 237, 255, rng.randint(60, 110)))

    draw.line([DIAMOND[0], DIAMOND[1]], fill=(201, 255, 255, 150), width=1)
    draw.line([DIAMOND[0], DIAMOND[3]], fill=(116, 236, 255, 95), width=1)
    draw.line([DIAMOND[3], DIAMOND[2], DIAMOND[1]], fill=(4, 115, 159, 88), width=1)

    shade = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    shade_draw = ImageDraw.Draw(shade)
    shade_draw.line([(6, 25), (48, 43), (90, 25)], fill=(0, 82, 124, 18), width=2)
    return Image.alpha_composite(image, shade)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    palettes = [
        ((21, 190, 226), (4, 132, 183), (86, 237, 255)),
        ((17, 178, 220), (3, 116, 172), (108, 246, 255)),
        ((27, 201, 232), (5, 141, 190), (123, 250, 255)),
    ]
    for index, palette in enumerate(palettes, 1):
        make_tile(index, *palette).save(OUT_DIR / f"terrain_water_flat_{index:02}.png")


if __name__ == "__main__":
    main()
