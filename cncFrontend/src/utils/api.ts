export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Interface corresponding to the job model on the backend
export interface Job {
  _id?: string;
  person_name: string;
  image_path: string;
  caricature_path?: string;
  svg_path?: string;
  gcode_path?: string;
  status: string;
  print_count: number;
  created_at: string;
  last_printed_at?: string;
}
