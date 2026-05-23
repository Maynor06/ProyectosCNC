import vpype
import vpype_cli
import os

# 1. DEFINE AQUÍ LOS LÍMITES FÍSICOS REALES DE TU MÁQUINA (en mm)
LIMIT_X = 450.0  # El ancho máximo real de tu área de dibujo
LIMIT_Y = 700.0  # El alto máximo real de tu área de dibujo

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


def svg_to_gcode(svg_path: str, gcode_path: str, max_width=450, max_height=650):
    os.makedirs(os.path.dirname(gcode_path), exist_ok=True)
    final_height = 0.0

    doc = vpype.read_multilayer_svg(svg_path, quantization=0.1)

    doc = vpype_cli.execute(
        "linemerge -t 0.5mm linesimplify -t 0.3 linesort",
        document=doc
    )

    bounds = get_bounds(doc)

    if bounds:
        xmin, ymin, xmax, ymax = bounds
        doc.translate(-xmin, -ymin)

        width = xmax - xmin
        height = ymax - ymin

        if width > 0 and height > 0:
            # Calcular escala para el tamaño deseado del avatar
            scale_x = max_width / width
            scale_y = max_height / height
            scale = min(scale_x, scale_y)

            doc.scale(scale)
            
            final_width = width * scale
            final_height = height * scale
            
            if final_width > LIMIT_X or final_height > LIMIT_Y:
                raise ValueError(
                    f"¡ALERTA SEGURIDAD! El G-Code generado ({final_width:.1f}x{final_height:.1f}mm) "
                    f"sobrepasa los límites físicos de la CNC ({LIMIT_X}x{LIMIT_Y}mm)."
                )

    with open(gcode_path, "w") as f:
        f.write("G21\n")  # Unidades en milímetros
        f.write("G90\n")  # Posicionamiento absoluto

        # Pluma arriba al iniciar (Invertido: M3 S127)
        f.write("M3 S127\n")
        f.write("G4 P0.05\n")

        for layer_id in doc.layers:
            layer = doc.layers[layer_id]

            for line in layer:
                points = list(line)
                if not points:
                    continue

                start = points[0]
                # Invertir el eje Y (el origen en SVG está arriba, en CNC está abajo)
                start_y = final_height - start.imag

                # Levantar pluma antes de moverse al inicio del trazo (Invertido: M3 S127)
                f.write("M3 S127\n")
                f.write("G4 P0.03\n")

                # Movimiento rápido al punto inicial (Velocidad en 12000)
                f.write(f"G0 X{start.real:.2f} Y{start_y:.2f} F12000\n")

                # Bajar pluma (Invertido: M5)
                f.write("M5\n")
                f.write("G4 P0.03\n")

                # Dibujar trayectoria (Velocidad en 12000, Eliminado el primer punto redundante)
                for p in points[1:]: 
                    p_y = final_height - p.imag
                    f.write(f"G1 X{p.real:.2f} Y{p_y:.2f} F12000\n")

                # Levantar pluma al terminar el trazo actual (Invertido: M3 S127)
                f.write("M3 S127\n")
                f.write("G4 P0.03\n")

        # Regresar a casa de forma segura
        f.write("G0 X0 Y0\n")
        f.write("M3 S127\n")