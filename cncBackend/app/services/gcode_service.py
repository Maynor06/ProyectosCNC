import vpype
import vpype_cli
import os


def get_bounds(doc):
    xmin = ymin = float("inf")
    xmax = ymax = float("-inf")
    found = False

    for layer in doc.layers.values():
        for line in layer:
            for p in line:
                found = True
                xmin = min(xmin, p.real)
                xmax = max(xmax, p.real)
                ymin = min(ymin, p.imag)
                ymax = max(ymax, p.imag)

    if not found:
        return None

    return xmin, ymin, xmax, ymax


def svg_to_gcode(svg_path: str, gcode_path: str, max_width=300, max_height=600):

    os.makedirs(os.path.dirname(gcode_path), exist_ok=True)

    doc = vpype.read_multilayer_svg(svg_path, quantization=0.1)

    doc = vpype_cli.execute(
        "linemerge -t 0.5mm linesimplify -t 0.3 linesort",
        document=doc
    )

    bounds = get_bounds(doc)

    if bounds:
        xmin, ymin, xmax, ymax = bounds

        width = xmax - xmin
        height = ymax - ymin

        if width > 0 and height > 0:
            scale_x = max_width / width
            scale_y = max_height / height
            scale = min(scale_x, scale_y)

            doc.scale(scale)

    with open(gcode_path, "w") as f:

        f.write("G21\n")
        f.write("G90\n")

        # Pluma arriba al iniciar
        f.write("M5\n")
        f.write("G4 P0.05\n")

        for layer_id in doc.layers:

            layer = doc.layers[layer_id]

            for line in layer:

                points = list(line)

                if not points:
                    continue

                start = points[0]

                # levantar
                f.write("M5\n")
                f.write("G4 P0.03\n")

                # mover rápido
                f.write(f"G0 X{start.real:.2f} Y{start.imag:.2f} F13000\n")

                # bajar
                f.write("M3 S127\n")
                f.write("G4 P0.03\n")

                # dibujar
                for p in points:
                    f.write(f"G1 X{p.real:.2f} Y{p.imag:.2f} F13000\n")

                # subir
                f.write("M5\n")
                f.write("G4 P0.03\n")

        # regresar home
        f.write("G0 X0 Y0\n")
        f.write("M5\n")