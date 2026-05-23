import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../utils/api';
import './CncView.css';

interface CncState {
  status: 'idle' | 'drawing' | 'paused';
  progress: number;
  current_line: number;
  total_lines: number;
  x: number;
  y: number;
  grbl_response: string;
}

export const CncView: React.FC = () => {
  const [cncState, setCncState] = useState<CncState | null>(null);

  useEffect(() => {
    // Poll the CNC status every second
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cnc/status`);
        if (response.ok) {
          const data = await response.json();
          setCncState(data);
        }
      } catch (error) {
        console.error('Error fetching CNC status:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: 'pause' | 'resume' | 'stop') => {
    try {
      await fetch(`${API_BASE_URL}/cnc/${action}`, { method: 'POST' });
    } catch (error) {
      console.error(`Error executing action ${action}:`, error);
    }
  };

  if (!cncState) {
    return <div className="cnc-loading">Conectando al CNC...</div>;
  }

  const percentage = cncState.total_lines > 0 
    ? ((cncState.current_line / cncState.total_lines) * 100).toFixed(1)
    : (cncState.progress * 100).toFixed(1); // fallback to raw progress if provided

  return (
    <div className="cnc-container glass-card">
      <h2 className="cnc-title">Monitor de Dibujo CNC</h2>
      
      <div className="cnc-status-display">
        <div className="status-ring-container">
          <svg className="progress-ring" width="200" height="200">
            <circle
              className="progress-ring-circle-bg"
              strokeWidth="12"
              fill="transparent"
              r="80"
              cx="100"
              cy="100"
            />
            <circle
              className="progress-ring-circle"
              strokeWidth="12"
              fill="transparent"
              r="80"
              cx="100"
              cy="100"
              style={{
                strokeDasharray: `${80 * 2 * Math.PI}`,
                strokeDashoffset: `${(80 * 2 * Math.PI) - ((Number(percentage) / 100) * (80 * 2 * Math.PI))}`
              }}
            />
          </svg>
          <div className="status-percentage">
            {percentage}%
          </div>
        </div>

        <div className="cnc-info">
          <div className="info-item">
            <span className="info-label">Estado:</span>
            <span className={`info-value status-${cncState.status}`}>
              {cncState.status.toUpperCase()}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Línea Actual:</span>
            <span className="info-value">{cncState.current_line} / {cncState.total_lines}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Posición (X, Y):</span>
            <span className="info-value">{cncState.x.toFixed(2)}, {cncState.y.toFixed(2)}</span>
          </div>
          {cncState.grbl_response && (
            <div className="info-item grbl-response">
              <span className="info-label">Respuesta GRBL:</span>
              <span className="info-value text-warning">{cncState.grbl_response}</span>
            </div>
          )}
        </div>
      </div>

      <div className="cnc-controls">
        <button 
          className="cnc-btn resume-btn"
          onClick={() => handleAction('resume')}
          disabled={cncState.status !== 'paused'}
        >
          Reanudar
        </button>
        <button 
          className="cnc-btn pause-btn"
          onClick={() => handleAction('pause')}
          disabled={cncState.status !== 'drawing'}
        >
          Pausar
        </button>
        <button 
          className="cnc-btn stop-btn"
          onClick={() => handleAction('stop')}
          disabled={cncState.status === 'idle'}
        >
          Detener
        </button>
      </div>
    </div>
  );
};
