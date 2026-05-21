import os
import base64


def save_base64_image(base64_data: str, output_path: str):

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    image_data = base64.b64decode(base64_data)

    with open(output_path, "wb") as f:
        f.write(image_data)