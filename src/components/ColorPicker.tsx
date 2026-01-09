import React, { useState, useCallback } from 'react';
import { ColorInfo } from '../types';
import { Box, Text, TextInput, Rows, Row, Inline } from '@canva/app-ui-kit';

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

  const handleFillColorChange = useCallback((value: string) => {
    setFillColor(value);
    onColorChange({
      fill: value,
      stroke: strokeColor,
      fillOpacity,
      strokeOpacity,
    });
  }, [strokeColor, fillOpacity, strokeOpacity, onColorChange]);

  const handleStrokeColorChange = useCallback((value: string) => {
    setStrokeColor(value);
    onColorChange({
      fill: fillColor,
      stroke: value,
      fillOpacity,
      strokeOpacity,
    });
  }, [fillColor, fillOpacity, strokeOpacity, onColorChange]);

  const handleFillOpacityChange = useCallback((value: string) => {
    setFillOpacity(value);
    onColorChange({
      fill: fillColor,
      stroke: strokeColor,
      fillOpacity: value,
      strokeOpacity,
    });
  }, [fillColor, strokeColor, strokeOpacity, onColorChange]);

  const handleStrokeOpacityChange = useCallback((value: string) => {
    setStrokeOpacity(value);
    onColorChange({
      fill: fillColor,
      stroke: strokeColor,
      fillOpacity,
      strokeOpacity: value,
    });
  }, [fillColor, strokeColor, fillOpacity, onColorChange]);

  return (
    <Box padding="1u">
      <Text size="medium" weight="bold" alignment="start">
        {label}
      </Text>
      
      <Rows spacing="1u">
        <Row>
          <Text size="small" alignment="start">Fill (Dolgu) Rengi:</Text>
          <Inline spacing="0.5u">
            <input
              type="color"
              value={fillColor}
              onChange={(e) => handleFillColorChange(e.target.value)}
              style={{ width: '40px', height: '32px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
            />
            <TextInput
              value={fillColor}
              onChange={handleFillColorChange}
              placeholder="#000000"
            />
          </Inline>
        </Row>
        
        <Row>
          <Text size="small" alignment="start">Fill Opacity: {fillOpacity}</Text>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={fillOpacity}
            onChange={(e) => handleFillOpacityChange(e.target.value)}
            style={{ width: '100%' }}
          />
        </Row>

        <Row>
          <Text size="small" alignment="start">Stroke (Çizgi) Rengi:</Text>
          <Inline spacing="0.5u">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => handleStrokeColorChange(e.target.value)}
              style={{ width: '40px', height: '32px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
            />
            <TextInput
              value={strokeColor}
              onChange={handleStrokeColorChange}
              placeholder="#000000"
            />
          </Inline>
        </Row>
        
        <Row>
          <Text size="small" alignment="start">Stroke Opacity: {strokeOpacity}</Text>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={strokeOpacity}
            onChange={(e) => handleStrokeOpacityChange(e.target.value)}
            style={{ width: '100%' }}
          />
        </Row>
      </Rows>
    </Box>
  );
};
