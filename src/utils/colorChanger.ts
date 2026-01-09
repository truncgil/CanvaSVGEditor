import { ColorInfo } from '../types';

/**
 * SVG string'indeki renkleri değiştirir
 */
export function changeSVGColor(
  svgString: string,
  colorInfo: ColorInfo
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = doc.documentElement;

  if (!svgElement || svgElement.tagName !== 'svg') {
    throw new Error('Geçerli bir SVG elementi bulunamadı');
  }

  // Recursive olarak tüm elementlerin renklerini değiştir
  const changeColorRecursive = (element: Element) => {
    // Fill rengini değiştir
    if (colorInfo.fill !== undefined) {
      element.setAttribute('fill', colorInfo.fill);
    }

    // Stroke rengini değiştir
    if (colorInfo.stroke !== undefined) {
      element.setAttribute('stroke', colorInfo.stroke);
    }

    // Opacity değerlerini değiştir
    if (colorInfo.fillOpacity !== undefined) {
      element.setAttribute('fill-opacity', colorInfo.fillOpacity);
    }

    if (colorInfo.strokeOpacity !== undefined) {
      element.setAttribute('stroke-opacity', colorInfo.strokeOpacity);
    }

    // Child elementleri recursive olarak işle
    Array.from(element.children).forEach((child) => {
      changeColorRecursive(child);
    });
  };

  // SVG içindeki tüm elementleri işle
  Array.from(svgElement.children).forEach((child) => {
    changeColorRecursive(child);
  });

  // Eğer SVG'de direkt path veya shape yoksa, SVG elementinin kendisini de işle
  if (svgElement.children.length === 0) {
    changeColorRecursive(svgElement);
  }

  // SVG string'ine dönüştür
  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

/**
 * SVG string'indeki belirli bir elementin rengini değiştirir
 */
export function changeElementColor(
  svgString: string,
  elementIndex: number,
  colorInfo: ColorInfo
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = doc.documentElement;

  if (!svgElement || svgElement.tagName !== 'svg') {
    throw new Error('Geçerli bir SVG elementi bulunamadı');
  }

  // Tüm elementleri topla
  const elements: Element[] = [];
  const collectElements = (parent: Element) => {
    Array.from(parent.children).forEach((child) => {
      const tagName = child.tagName.toLowerCase();
      if (tagName !== 'g') {
        elements.push(child);
      } else {
        collectElements(child);
      }
    });
  };

  collectElements(svgElement);

  if (elementIndex < 0 || elementIndex >= elements.length) {
    throw new Error('Geçersiz element index');
  }

  const targetElement = elements[elementIndex];

  // Renkleri değiştir
  if (colorInfo.fill !== undefined) {
    targetElement.setAttribute('fill', colorInfo.fill);
  }

  if (colorInfo.stroke !== undefined) {
    targetElement.setAttribute('stroke', colorInfo.stroke);
  }

  if (colorInfo.fillOpacity !== undefined) {
    targetElement.setAttribute('fill-opacity', colorInfo.fillOpacity);
  }

  if (colorInfo.strokeOpacity !== undefined) {
    targetElement.setAttribute('stroke-opacity', colorInfo.strokeOpacity);
  }

  // SVG string'ine dönüştür
  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

/**
 * Hex rengini RGB'ye dönüştürür
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * RGB'yi hex'e dönüştürür
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}
