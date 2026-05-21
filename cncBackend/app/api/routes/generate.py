from fastapi import APIRouter, UploadFile, File, Form
from datetime import datetime

from app.services.openai_service import generate_line_art
from app.services.image_service import save_base64_image
from app.core.database import jobs_collection
from app.services.vector_service import png_to_svg
from app.services.gcode_service import svg_to_gcode

router = APIRouter()


@router.post("/generate")
async def generate_job(
    person_name: str = Form(...),
    file: UploadFile = File(...)
):

    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")

    # Guardar original
    original_path = f"uploads/{timestamp}_{file.filename}"

    with open(original_path, "wb") as f:
        f.write(await file.read())

    # OpenAI genera caricatura
    caricature_b64 = generate_line_art(original_path)

    caricature_path = f"generated/caricatures/{timestamp}.png"

    # Guardar PNG primero
    save_base64_image(
        caricature_b64,
        caricature_path
    )

    # Luego vectorizar
    svg_path = f"generated/svg/{timestamp}.svg"

    png_to_svg(
        caricature_path,
        svg_path
    )

    # Luego generar gcode
    gcode_path = f"generated/gcode/{timestamp}.gcode"

    svg_to_gcode(
        svg_path,
        gcode_path
    )

    # Guardar en mongo
    job = {
        "person_name": person_name,
        "image_path": original_path,
        "caricature_path": caricature_path,
        "svg_path": svg_path,
        "gcode_path": gcode_path,
        "status": "ready_to_draw",
        "created_at": datetime.utcnow(),
        "print_count": 0
    }

    result = await jobs_collection.insert_one(job)

    return {
        "job_id": str(result.inserted_id),
        "status": "ok"
    }