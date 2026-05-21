from PIL import Image
import subprocess
import os


def png_to_svg(input_path: str, output_path: str):

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    temp_png = input_path.replace(".png", "_scaled.png")
    temp_pbm = input_path.replace(".png", ".pbm")

    img = Image.open(input_path)

    # Escalar a máximo 1000x1000 para mantener detalles en impresiones grandes (ej. 70cm)
    img.thumbnail((1000, 1000))

    # monocromático puro
    img = img.convert("1")

    img.save(temp_png)

    img.save(temp_pbm)

    subprocess.run([
        "potrace",
        temp_pbm,
        "-s",
        "-t", "20",
        "-O", "0.5",
        "-o",
        output_path
    ], check=True)

    os.remove(temp_png)
    os.remove(temp_pbm)