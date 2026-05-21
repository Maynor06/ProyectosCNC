import React, { useState, useRef, useEffect } from 'react';
import { Robot } from './Robot';
import { API_BASE_URL } from '../utils/api';
import './UploadView.css';

export const UploadView: React.FC = () => {
  const [personName, setPersonName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [generatedImagePath, setGeneratedImagePath] = useState<string | null>(null);
  const [generatedGcodePath, setGeneratedGcodePath] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const robotRef = useRef<any>(null);

  useEffect(() => {
    if (status === 'processing') {
      robotRef.current?.mostrarBola();
    } else {
      robotRef.current?.saludo();
    }
  }, [status]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatus('idle');
      setGeneratedImagePath(null);
      setGeneratedGcodePath(null);
      setProgress(0);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPersonName('');
    setStatus('idle');
    setGeneratedImagePath(null);
    setGeneratedGcodePath(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !personName) return;

    setStatus('processing');
    setProgress(10);

    const formData = new FormData();
    formData.append('person_name', personName);
    formData.append('file', selectedFile);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 1000);

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en la generación');
      }

      const result = await response.json();
      console.log('Result:', result);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(async () => {
        await fetchJobDetails(result.job_id);
        setStatus('done');
      }, 500);

    } catch (error) {
      console.error(error);
      alert('Error al generar la imagen. Revisa la consola.');
      setStatus('idle');
      clearInterval(progressInterval);
      setProgress(0);
    }
  };

  const fetchJobDetails = async (jobId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`);
      const jobs = await res.json();
      const myJob = jobs.find((j: any) => j._id === jobId);
      if (myJob) {
        if (myJob.caricature_path) {
          setGeneratedImagePath(`${API_BASE_URL}/${myJob.caricature_path}`);
        }
        if (myJob.gcode_path) {
          setGeneratedGcodePath(myJob.gcode_path);
        }
      }
    } catch (error) {
      console.error('Failed to fetch job details', error);
    }
  };

  return (
    <div className="upload-view-wrapper">
      <div className="form-section glass-card">
        {status === 'idle' && (
          <>
            <h2>Crear Nuevo Avatar CNC</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="personName">Nombre de la Persona</label>
                <input
                  type="text"
                  id="personName"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>

              <div className="input-group">
                <label>Subir o tomar foto</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="file-input"
                    id="fileInput"
                  />
                  <label htmlFor="fileInput" className="file-input-button">
                    {previewUrl ? 'Cambiar Foto' : 'Elegir o Tomar Foto'}
                  </label>
                </div>
              </div>

              {previewUrl && (
                <div className="preview-container">
                  <span className="preview-label">Vista Previa</span>
                  <img src={previewUrl} alt="Preview" className="image-preview" />
                </div>
              )}

              <div className="actions">
                <button type="button" className="btn-secondary" onClick={handleClear}>
                  Limpiar
                </button>
                <button type="submit" className="btn-primary" disabled={!selectedFile || !personName}>
                  Generar
                </button>
              </div>
            </form>
          </>
        )}

        {status === 'processing' && (
          <div className="loading-card-content">
            <h2 className="loading-title">Procesando tu Avatar</h2>
            <p className="loading-subtitle">El robot está vectorizando tu imagen...</p>
            
            <div className="robot-loader-container">
              <Robot ref={robotRef} style={{ width: '100%', height: '100%' }} />
            </div>

            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              <p className="progress-text">Cargando... {progress}%</p>
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="done-card-content">
            <h2>¡Avatar CNC Generado!</h2>
            <p className="success-subtitle">Tu imagen ha sido convertida a vectores para CNC.</p>
            
            <div className="result-comparison">
              <div className="result-image-box">
                <span className="image-badge">Original</span>
                {previewUrl && <img src={previewUrl} alt="Original" className="result-img" />}
              </div>
              <div className="result-image-box">
                <span className="image-badge avatar-badge">Avatar CNC</span>
                {generatedImagePath && (
                  <img 
                    src={generatedImagePath} 
                    alt="Generated" 
                    className="result-img" 
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Error')}
                  />
                )}
              </div>
            </div>

            <div className="result-actions">
              {generatedGcodePath && (
                <a 
                  href={`${API_BASE_URL}/${generatedGcodePath}`}
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary download-action-btn"
                >
                  Descargar G-Code
                </a>
              )}
              <button className="btn-secondary reset-btn" onClick={handleClear}>
                Crear Otro Avatar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
