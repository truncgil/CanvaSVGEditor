import React, { useState, useCallback } from 'react';
import { ColorInfo } from '../types';

interface ColorPickerProps {
  onColorChange: (colorInfo: ColorInfo) => void;
  initialColor?: ColorInfo;
  label?: string;
}

/**
 * Renk seçici paneli component'i
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  onColorChange,
  initialColor,
  label = 'Renk Seç',
}) => {
  const [fillColor, setFillColor] = useState(initialColor?.fill || '#000000');
  const [strokeColor, setStrokeColor] = useState(initialColor?.stroke || '#000000');
  const [fillOpacity, setFillOpacity] = useState(initialColor?.fillOpacity || '1');
  const [strokeOpacity, setStrokeOpacity] = useState(initialColor?.strokeOpacity || '1');

  const handleFillColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setFillColor(color);
    onColorChange({
      fill: color,
      stroke: strokeColor,
      fillOpacity,
      strokeOpacity,
    });
  }, [strokeColor, fillOpacity, strokeOpacity, onColorChange]);

  const handleStrokeColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setStrokeColor(color);
    onColorChange({
      fill: fillColor,
      stroke: color,
      fillOpacity,
      strokeOpacity,
    });
  }, [fillColor, fillOpacity, strokeOpacity, onColorChange]);

  const handleFillOpacityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const opacity = e.target.value;
    setFillOpacity(opacity);
    onColorChange({
      fill: fillColor,
      stroke: strokeColor,
      fillOpacity: opacity,
      strokeOpacity,
    });
  }, [fillColor, strokeColor, strokeOpacity, onColorChange]);

  const handleStrokeOpacityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const opacity = e.target.value;
    setStrokeOpacity(opacity);
    onColorChange({
      fill: fillColor,
      stroke: strokeColor,
      fillOpacity,
      strokeOpacity: opacity,
    });
  }, [fillColor, strokeColor, fillOpacity, onColorChange]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{label}</h3>
      
      <div style={styles.section}>
        <label style={styles.label}>
          Fill (Dolgu) Rengi:
          <div style={styles.colorInputContainer}>
            <input
              type="color"
              value={fillColor}
              onChange={handleFillColorChange}
              style={styles.colorInput}
            />
            <input
              type="text"
              value={fillColor}
              onChange={(e) => {
                setFillColor(e.target.value);
                handleFillColorChange({ target: { value: e.target.value } } as any);
              }}
              style={styles.textInput}
              placeholder="#000000"
            />
          </div>
        </label>
        
        <label style={styles.label}>
          Fill Opacity:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={fillOpacity}
            onChange={handleFillOpacityChange}
            style={styles.rangeInput}
          />
          <span style={styles.opacityValue}>{fillOpacity}</span>
        </label>
      </div>

      <div style={styles.section}>
        <label style={styles.label}>
          Stroke (Çizgi) Rengi:
          <div style={styles.colorInputContainer}>
            <input
              type="color"
              value={strokeColor}
              onChange={handleStrokeColorChange}
              style={styles.colorInput}
            />
            <input
              type="text"
              value={strokeColor}
              onChange={(e) => {
                setStrokeColor(e.target.value);
                handleStrokeColorChange({ target: { value: e.target.value } } as any);
              }}
              style={styles.textInput}
              placeholder="#000000"
            />
          </div>
        </label>
        
        <label style={styles.label}>
          Stroke Opacity:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={strokeOpacity}
            onChange={handleStrokeOpacityChange}
            style={styles.rangeInput}
          />
          <span style={styles.opacityValue}>{strokeOpacity}</span>
        </label>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
  },
  colorInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  },
  colorInput: {
    width: '50px',
    height: '40px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  textInput: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'monospace',
  },
  rangeInput: {
    width: '100%',
    marginTop: '4px',
  },
  opacityValue: {
    display: 'inline-block',
    marginLeft: '8px',
    fontSize: '12px',
    color: '#777',
    fontFamily: 'monospace',
  },
};
