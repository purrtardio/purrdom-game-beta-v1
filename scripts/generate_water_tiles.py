from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


TERRAIN_DIR = Path("assets/generated/terrain")
OUTPUT_SIZE = (112, 60)
OUTPUT_DIAMOND = [(56, 4), (108, 26), (56, 50), (4, 26)]
TEXTURE_SIZE = (128, 128)


def source_top_polygon(image):
    width, height = image.size
    return [
        (round(width * 0.5), round(height * 0.08)),
        (round(width * 0.93), round(height * 0.36)),
        (round(width * 0.5), round(height * 0.62)),
        (round(width * 0.07), round(height * 0.36)),
    ]


def extract_top_face(source_path, output_path):
    source = Image.open(source_path).convert("RGBA")
    mask = Image.new("L", source.size, 0)
    ImageDraw.Draw(mask).polygon(source_top_polygon(source), fill=255)

    left, top, right, bottom = mask.getbbox()
    face = Image.new("RGBA", source.size, (0, 0, 0, 0))
    face.alpha_composite(source)
    face.putalpha(mask)
    face = face.crop((left, top, right, bottom))

    resample = Image.Resampling.NEAREST
    face = face.resize((104, 48), resample)

    output = Image.new("RGBA", OUTPUT_SIZE, (0, 0, 0, 0))
    output.alpha_composite(face, (4, 3))

    diamond_mask = Image.new("L", OUTPUT_SIZE, 0)
    ImageDraw.Draw(diamond_mask).polygon(OUTPUT_DIAMOND, fill=255)
    diamond_mask = diamond_mask.filter(ImageFilter.GaussianBlur(0.25))

    alpha = output.getchannel("A")
    output.putalpha(Image.composite(alpha, Image.new("L", OUTPUT_SIZE, 0), diamond_mask))

    draw = ImageDraw.Draw(output)
    draw.line([OUTPUT_DIAMOND[0], OUTPUT_DIAMOND[1]], fill=(235, 255, 255, 150), width=1)
    draw.line([OUTPUT_DIAMOND[0], OUTPUT_DIAMOND[3]], fill=(149, 242, 255, 110), width=1)
    draw.line([OUTPUT_DIAMOND[3], OUTPUT_DIAMOND[2], OUTPUT_DIAMOND[1]], fill=(2, 109, 170, 118), width=1)
    output.save(output_path)


def make_water_texture():
    texture = Image.new("RGBA", TEXTURE_SIZE, (0, 0, 0, 255))
    crops = []
    for index in range(1, 4):
        source = Image.open(TERRAIN_DIR / f"terrain_water_iso_{index:02}.png").convert("RGBA")
        crops.append(source.crop((40, 22, 90, 44)).resize((80, 36), Image.Resampling.NEAREST))

    for y in range(-18, TEXTURE_SIZE[1] + 36, 32):
        for x in range(-24, TEXTURE_SIZE[0] + 80, 74):
            crop = crops[((x // 74) + (y // 32)) % len(crops)]
            if ((x + y) // 36) % 2:
                crop = crop.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            texture.alpha_composite(crop, (x, y))

    texture = ImageEnhance.Contrast(texture).enhance(0.86)
    texture = ImageEnhance.Color(texture).enhance(1.08)
    texture.save(TERRAIN_DIR / "terrain_water_texture.png")


def main():
    for index in range(1, 4):
        extract_top_face(
            TERRAIN_DIR / f"terrain_water_iso_{index:02}.png",
            TERRAIN_DIR / f"terrain_water_flat_{index:02}.png",
        )
    make_water_texture()


if __name__ == "__main__":
    main()
