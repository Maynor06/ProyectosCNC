from openai import OpenAI
from app.core.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)


def generate_line_art(image_path: str):

    with open(image_path, "rb") as image_file:

        response = client.images.edit(
            model="gpt-image-1",
            image=image_file,
            prompt="""
            Convert this portrait into clean black and white line-art,
            suitable for CNC vector tracing.
            High contrast.
            Minimal shading.
            Strong contours only.
            No background.
            """
        )

    return response.data[0].b64_json