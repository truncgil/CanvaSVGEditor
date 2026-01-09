import React, { useState, useCallback, useEffect } from 'react';
import { useCanvaSelection } from '../hooks/useCanvaSelection';
import { splitSVGComprehensive } from '../utils/svgSplitter';
import { groupSVGs } from '../utils/svgGrouper';
import { changeSVGColor } from '../utils/colorChanger';
import { extractColors } from '../utils/svgParser';
import { ColorPicker } from './ColorPicker';
import { InlineColorEditor } from './InlineColorEditor';
import { ColorInfo } from '../types';
import { Box, Text, Button, Rows, Row, Inline } from '@canva/app-ui-kit';

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
      // Canva UI'da toast mesajı gösterilebilir
      console.warn('Lütfen bir SVG seçin');
      return;
    }

    try {
      const svgStrings = splitSVGComprehensive(currentSVGString);
      
      if (svgStrings.length === 0) {
        console.warn('SVG parçalara ayrılamadı');
        return;
      }

      // Yeni SVG elementleri oluştur
      await createSVGElements(svgStrings);
    } catch (err) {
      console.error('Parçalama hatası:', err);
    }
  }, [currentSVGString, createSVGElements]);

  // SVG'leri grupla (Ctrl+G)
  const handleGroup = useCallback(async () => {
    if (selectedElements.length < 2) {
      console.warn('Gruplamak için en az 2 element seçmelisiniz');
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
        console.warn('Yeterli SVG bulunamadı');
        return;
      }

      // SVG'leri grupla
      const groupedSVG = groupSVGs(svgStrings);
      
      // Yeni grup SVG'sini oluştur
      await createSVGElements([groupedSVG]);
    } catch (err) {
      console.error('Gruplama hatası:', err);
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
    <Box padding="2u">
      <Rows spacing="2u">
        <Row>
          <Inline spacing="1u" alignment="center">
            <Text size="large" weight="bold">
              SVG Editor
            </Text>
            <Button
              onClick={readSelection}
              disabled={isLoading}
              variant="secondary"
              size="small"
            >
              {isLoading ? 'Yükleniyor...' : 'Yenile'}
            </Button>
          </Inline>
        </Row>

        {error && (
          <Row>
            <Box padding="1u" background="criticalLow">
              <Text size="small" tone="critical">
                Hata: {error}
              </Text>
            </Box>
          </Row>
        )}

        <Row>
          <Box>
            <Text size="medium" weight="bold">
              Seçili Elementler
            </Text>
            {selectedElements.length === 0 ? (
              <Text size="small" tone="secondary">
                Canva'da bir SVG seçin
              </Text>
            ) : (
              <Box paddingTop="1u">
                <Text size="small">
                  {selectedElements.length} element seçili
                </Text>
                {currentSVGString && (
                  <Box paddingTop="1u">
                    <div
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        overflow: 'auto',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '8px',
                      }}
                      dangerouslySetInnerHTML={{ __html: currentSVGString }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Row>

        <Row>
          <Box>
            <Text size="medium" weight="bold">
              İşlemler
            </Text>
            <Rows spacing="1u" paddingTop="1u">
              <Row>
                <Button
                  onClick={handleSplit}
                  disabled={!currentSVGString || isLoading}
                  variant="primary"
                  stretch
                >
                  Parçalarına Ayır (Ctrl+U)
                </Button>
              </Row>
              <Row>
                <Button
                  onClick={handleGroup}
                  disabled={selectedElements.length < 2 || isLoading}
                  variant="primary"
                  stretch
                >
                  Grupla (Ctrl+G)
                </Button>
              </Row>
            </Rows>
          </Box>
        </Row>

        <Row>
          <Box>
            <Text size="medium" weight="bold">
              Renk Düzenleme
            </Text>
            <Box paddingTop="1u">
              <ColorPicker
                onColorChange={handleColorChange}
                initialColor={currentColor}
                label="SVG Rengini Değiştir"
              />
            </Box>
          </Box>
        </Row>

        <Row>
          <Box>
            <Text size="medium" weight="bold">
              Klavye Kısayolları
            </Text>
            <Box paddingTop="1u">
              <Rows spacing="0.5u">
                <Row>
                  <Text size="small">
                    <strong>Ctrl+U:</strong> SVG'yi parçalarına ayır
                  </Text>
                </Row>
                <Row>
                  <Text size="small">
                    <strong>Ctrl+G:</strong> Seçili elementleri grupla
                  </Text>
                </Row>
              </Rows>
            </Box>
          </Box>
        </Row>
      </Rows>

      {/* Inline Color Editor */}
      {showInlineEditor && inlineEditorPosition && (
        <InlineColorEditor
          onColorChange={handleColorChange}
          initialColor={currentColor}
          position={inlineEditorPosition}
          visible={showInlineEditor}
        />
      )}
    </Box>
  );
};
