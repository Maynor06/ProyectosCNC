import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../utils/api';
import type { Job } from '../utils/api';
import './GalleryView.css';

export const GalleryView: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.reverse()); // Show newest first
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedraw = async (jobId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/redraw`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Error requesting redraw:', error);
    }
  };

  if (loading) {
    return <div className="loading-state">Cargando galería...</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="empty-state glass-card">
        <h3>Aún no hay imágenes</h3>
        <p>Sube una foto para generar tu primer avatar CNC.</p>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <h2 className="gallery-title">Galería de Avatares CNC</h2>
      <div className="gallery-grid">
        {jobs.map((job) => (
          <div key={job._id} className="gallery-card glass-card">
            <div className="card-header">
              <h3>{job.person_name}</h3>
              <span className={`status-badge ${job.status}`}>
                {job.status === 'ready_to_draw' ? 'Listo' : job.status}
              </span>
            </div>

            <div className="images-comparison">
              <div className="image-wrapper">
                <span className="image-label">Original</span>
                <img
                  src={`${API_BASE_URL}/${job.image_path}`}
                  alt="Original"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Error')}
                />
              </div>
              <div className="image-wrapper">
                <span className="image-label">Generado</span>
                {job.caricature_path ? (
                  <img
                    src={`${API_BASE_URL}/${job.caricature_path}`}
                    alt="Caricature"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Error')}
                  />
                ) : (
                  <div className="placeholder-image">Pendiente</div>
                )}
              </div>
            </div>

            <div className="card-footer">
              <div className="footer-stats">
                <small>Creado: {new Date(job.created_at).toLocaleString()}</small>
                <small>Impresiones: {job.print_count}</small>
              </div>
              <div className="footer-actions">
                {job.gcode_path && (
                  <a
                    href={`${API_BASE_URL}/${job.gcode_path}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-btn"
                  >
                    Descargar G-Code
                  </a>
                )}
                {job.status === 'completed' && (
                  <button
                    onClick={() => handleRedraw(job._id!)}
                    className="redraw-btn"
                  >
                    Volver a Dibujar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
