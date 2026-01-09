import React, { useState, useCallback, useEffect } from 'react';
import { useCanvaSelection } from '../hooks/useCanvaSelection';
import { splitSVGComprehensive, ungroupSVG } from '../utils/svgSplitter';
import { groupSVGs } from '../utils/svgGrouper';
import { changeSVGColor } from '../utils/colorChanger';
import { extractColors } from '../utils/svgParser';
import { ColorPicker } from './ColorPicker';
import { InlineColorEditor } from './InlineColorEditor';
import { ColorInfo } from '../types';

/**
 * SVG düzenleme ana component'i
 */
export const SVGEditor: React.FC = () => {
  const {
    selectedElements,
    isLoading,
    error,
    readSelection,
    createSVGElements,
    getSelectedSVGString,
  } = useCanvaSelection();

  const [currentSVGString, setCurrentSVGString] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<ColorInfo>({});
  const [showInlineEditor, setShowInlineEditor] = useState(false);
  const [inlineEditorPosition, setInlineEditorPosition] = useState<{ x: number; y: number } | undefined>();

  // Seçim değiştiğinde SVG string'ini al
  useEffect(() => {
    const loadSVG = async () => {
      if (selectedElements.length > 0) {
        const svgString = await getSelectedSVGString();
        if (svgString) {
          setCurrentSVGString(svgString);
          const colors = extractColors(svgString);
          setCurrentColor(colors);
        }
      } else {
        setCurrentSVGString(null);
        setCurrentColor({});
      }
    };

    loadSVG();
  }, [selectedElements, getSelectedSVGString]);

  // SVG'yi parçalarına ayır (Ctrl+U)
  const handleSplit = useCallback(async () => {
    if (!currentSVGString) {
      alert('Lütfen bir SVG seçin');
      return;
    }

    try {
      const svgStrings = splitSVGComprehensive(currentSVGString);
      
      if (svgStrings.length === 0) {
        alert('SVG parçalara ayrılamadı');
        return;
      }

      // Yeni SVG elementleri oluştur
      await createSVGElements(svgStrings);
      
      // Eski seçili elementi sil (isteğe bağlı - Canva API'ye bağlı)
      // await deleteSelection();
    } catch (err) {
      console.error('Parçalama hatası:', err);
      alert('SVG parçalama sırasında hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
    }
  }, [currentSVGString, createSVGElements]);

  // SVG'leri grupla (Ctrl+G)
  const handleGroup = useCallback(async () => {
    if (selectedElements.length < 2) {
      alert('Gruplamak için en az 2 element seçmelisiniz');
      return;
    }

    try {
      // Seçili tüm elementlerin SVG string'lerini al
      const svgStrings: string[] = [];
      
      for (const element of selectedElements) {
        if (element.url) {
          try {
            const response = await fetch(element.url);
            const svgText = await response.text();
            svgStrings.push(svgText);
          } catch (err) {
            console.error('SVG yükleme hatası:', err);
          }
        }
      }

      if (svgStrings.length < 2) {
        alert('Yeterli SVG bulunamadı');
        return;
      }

      // SVG'leri grupla
      const groupedSVG = groupSVGs(svgStrings);
      
      // Yeni grup SVG'sini oluştur
      await createSVGElements([groupedSVG]);
    } catch (err) {
      console.error('Gruplama hatası:', err);
      alert('SVG gruplama sırasında hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
    }
  }, [selectedElements, createSVGElements]);

  // Renk değiştir
  const handleColorChange = useCallback(async (colorInfo: ColorInfo) => {
    if (!currentSVGString) {
      return;
    }

    try {
      const updatedSVG = changeSVGColor(currentSVGString, colorInfo);
      
      // Güncellenmiş SVG'yi Canva'ya ekle
      await createSVGElements([updatedSVG]);
      
      setCurrentColor(colorInfo);
    } catch (err) {
      console.error('Renk değiştirme hatası:', err);
      alert('Renk değiştirme sırasında hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
    }
  }, [currentSVGString, createSVGElements]);

  // Mouse pozisyonunu takip et (inline editor için)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (selectedElements.length > 0) {
        setInlineEditorPosition({ x: e.clientX + 10, y: e.clientY + 10 });
        setShowInlineEditor(true);
      }
    };

    const handleMouseLeave = () => {
      setShowInlineEditor(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [selectedElements]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>SVG Editor</h2>
        <button
          onClick={readSelection}
          disabled={isLoading}
          style={styles.refreshButton}
        >
          {isLoading ? 'Yükleniyor...' : 'Yenile'}
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          Hata: {error}
        </div>
      )}

      <div style={styles.content}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Seçili Elementler</h3>
          {selectedElements.length === 0 ? (
            <p style={styles.infoText}>Canva'da bir SVG seçin</p>
          ) : (
            <div style={styles.selectedInfo}>
              <p>{selectedElements.length} element seçili</p>
              {currentSVGString && (
                <div style={styles.svgPreview}>
                  <div
                    style={styles.svgContainer}
                    dangerouslySetInnerHTML={{ __html: currentSVGString }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>İşlemler</h3>
          <div style={styles.buttonGroup}>
            <button
              onClick={handleSplit}
              disabled={!currentSVGString || isLoading}
              style={styles.button}
              title="Ctrl+U"
            >
              Parçalarına Ayır (Ctrl+U)
            </button>
            <button
              onClick={handleGroup}
              disabled={selectedElements.length < 2 || isLoading}
              style={styles.button}
              title="Ctrl+G"
            >
              Grupla (Ctrl+G)
            </button>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Renk Düzenleme</h3>
          <ColorPicker
            onColorChange={handleColorChange}
            initialColor={currentColor}
            label="SVG Rengini Değiştir"
          />
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Klavye Kısayolları</h3>
          <ul style={styles.shortcutsList}>
            <li><strong>Ctrl+U:</strong> SVG'yi parçalarına ayır</li>
            <li><strong>Ctrl+G:</strong> Seçili elementleri grupla</li>
          </ul>
        </div>
      </div>

      {/* Inline Color Editor */}
      {showInlineEditor && inlineEditorPosition && (
        <InlineColorEditor
          onColorChange={handleColorChange}
          initialColor={currentColor}
          position={inlineEditorPosition}
          visible={showInlineEditor}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  section: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  infoText: {
    color: '#666',
    fontSize: '14px',
    margin: 0,
  },
  selectedInfo: {
    fontSize: '14px',
    color: '#333',
  },
  svgPreview: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  svgContainer: {
    maxWidth: '100%',
    maxHeight: '200px',
    overflow: 'auto',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  button: {
    padding: '12px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  shortcutsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '14px',
    color: '#555',
  },
};
