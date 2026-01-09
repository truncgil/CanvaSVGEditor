import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ColorInfo } from '../types';

interface InlineColorEditorProps {
  onColorChange: (colorInfo: ColorInfo) => void;
  initialColor?: ColorInfo;
  position?: { x: number; y: number };
  visible?: boolean;
}

const QUICK_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
];

/**
 * Inline renk düzenleyici component'i
 * Seçili element üzerinde hover/selection durumunda görünür
 */
export const InlineColorEditor: React.FC<InlineColorEditorProps> = ({
  onColorChange,
  initialColor,
  position,
  visible = false,
}) => {
  const [fillColor, setFillColor] = useState(initialColor?.fill || '#000000');
  const [strokeColor, setStrokeColor] = useState(initialColor?.stroke || '#000000');
  const [isExpanded, setIsExpanded] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialColor) {
      setFillColor(initialColor.fill || '#000000');
      setStrokeColor(initialColor.stroke || '#000000');
    }
  }, [initialColor]);

  // Position değiştiğinde editor'ü konumlandır
  useEffect(() => {
    if (editorRef.current && position && visible) {
      editorRef.current.style.left = `${position.x}px`;
      editorRef.current.style.top = `${position.y}px`;
    }
  }, [position, visible]);

  const handleFillColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setFillColor(color);
    onColorChange({
      fill: color,
      stroke: strokeColor,
    });
  }, [strokeColor, onColorChange]);

  const handleStrokeColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setStrokeColor(color);
    onColorChange({
      fill: fillColor,
      stroke: color,
    });
  }, [fillColor, onColorChange]);

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={editorRef}
      style={{
        ...styles.container,
        position: 'fixed',
        zIndex: 10000,
        display: visible ? 'block' : 'none',
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div style={styles.header}>
        <span style={styles.headerText}>Renk Düzenle</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={styles.toggleButton}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div style={styles.content}>
          <div style={styles.colorRow}>
            <label style={styles.colorLabel}>
              Fill:
              <input
                type="color"
                value={fillColor}
                onChange={handleFillColorChange}
                style={styles.colorInput}
                title="Fill rengi"
              />
            </label>
            <label style={styles.colorLabel}>
              Stroke:
              <input
                type="color"
                value={strokeColor}
                onChange={handleStrokeColorChange}
                style={styles.colorInput}
                title="Stroke rengi"
              />
            </label>
          </div>

          <div style={styles.quickColors}>
            <span style={styles.quickLabel}>Hızlı Renkler:</span>
            <div style={styles.quickColorGrid}>
              {QUICK_COLORS.map((color) => (
                <button
                  key={color}
                  style={{
                    ...styles.quickColorButton,
                    backgroundColor: color,
                  }}
                  onClick={() => {
                    setFillColor(color);
                    onColorChange({
                      fill: color,
                      stroke: strokeColor,
                    });
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid #ddd',
    minWidth: '200px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
  },
  headerText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#666',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: '12px',
  },
  colorRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
  },
  colorLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '12px',
    color: '#555',
    flex: 1,
  },
  colorInput: {
    width: '100%',
    height: '32px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  quickColors: {
    marginTop: '8px',
  },
  quickLabel: {
    fontSize: '12px',
    color: '#555',
    marginBottom: '8px',
    display: 'block',
  },
  quickColorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '4px',
  },
  quickColorButton: {
    width: '100%',
    aspectRatio: '1',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '0',
    transition: 'transform 0.1s',
  },
};
