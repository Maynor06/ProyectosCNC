from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Job(BaseModel):
    #id: int
    person_name: str
    image_path: str
    caricature_path: Optional[str] = None

    svg_path: Optional[str] = None

    gcode_path: Optional[str] = None

    status: str = "uploaded"

    print_count: int = 0

    created_at: datetime = datetime.utcnow()

    last_printed_at: Optional[datetime] = None