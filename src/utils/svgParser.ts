import { ParsedSVG, SVGElement } from '../types';

/**
 * SVG string'ini parse eder ve elementlerine ayırır
 */
export function parseSVG(svgString: string): ParsedSVG {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  
  // Parse hatası kontrolü
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('SVG parse hatası: ' + parseError.textContent);
  }

  const svgElement = doc.documentElement;
  if (!svgElement || svgElement.tagName !== 'svg') {
    throw new Error('Geçerli bir SVG elementi bulunamadı');
  }

  const elements: SVGElement[] = [];
  const viewBox = svgElement.getAttribute('viewBox') || undefined;
  const width = svgElement.getAttribute('width') || undefined;
  const height = svgElement.getAttribute('height') || undefined;
  const xmlns = svgElement.getAttribute('xmlns') || 'http://www.w3.org/2000/svg';

  // SVG içindeki tüm child elementleri topla
  const collectElements = (parent: Element, parentGroup?: Element) => {
    Array.from(parent.children).forEach((child) => {
      const elementType = getElementType(child);
      
      if (elementType === 'group') {
        // Group elementi - recursive olarak içindeki elementleri topla
        collectElements(child, child);
      } else {
        // Diğer elementler
        const attributes: Record<string, string> = {};
        Array.from(child.attributes).forEach((attr) => {
          attributes[attr.name] = attr.value;
        });

        // Element için SVG string oluştur
        const svgString = createSVGStringForElement(child, viewBox, width, height, xmlns);

        elements.push({
          type: elementType,
          element: child,
          svgString,
          attributes,
        });
      }
    });
  };

  collectElements(svgElement);

  return {
    elements,
    viewBox,
    width,
    height,
    xmlns,
  };
}

/**
 * Element tipini belirler
 */
function getElementType(element: Element): SVGElement['type'] {
  const tagName = element.tagName.toLowerCase();
  
  switch (tagName) {
    case 'path':
      return 'path';
    case 'g':
      return 'group';
    case 'circle':
      return 'circle';
    case 'rect':
      return 'rect';
    case 'ellipse':
      return 'ellipse';
    case 'line':
      return 'line';
    case 'polyline':
      return 'polyline';
    case 'polygon':
      return 'polygon';
    case 'text':
      return 'text';
    default:
      return 'other';
  }
}

/**
 * Tek bir element için SVG string oluşturur
 */
function createSVGStringForElement(
  element: Element,
  viewBox?: string,
  width?: string,
  height?: string,
  xmlns: string = 'http://www.w3.org/2000/svg'
): string {
  const svg = document.createElementNS(xmlns, 'svg');
  
  if (viewBox) {
    svg.setAttribute('viewBox', viewBox);
  }
  if (width) {
    svg.setAttribute('width', width);
  }
  if (height) {
    svg.setAttribute('height', height);
  }
  svg.setAttribute('xmlns', xmlns);

  // Elementi klonla ve SVG'ye ekle
  const clonedElement = element.cloneNode(true) as Element;
  svg.appendChild(clonedElement);

  // SVG string'e dönüştür
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svg);
}

/**
 * SVG string'inden renk bilgilerini çıkarır
 */
export function extractColors(svgString: string): { fill?: string; stroke?: string } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = doc.documentElement;

  const getColorFromElement = (element: Element): { fill?: string; stroke?: string } => {
    const fill = element.getAttribute('fill') || 
                 window.getComputedStyle(element as any).fill ||
                 undefined;
    const stroke = element.getAttribute('stroke') || 
                   window.getComputedStyle(element as any).stroke ||
                   undefined;

    return { fill, stroke };
  };

  // İlk path veya shape elementini bul
  const firstElement = svgElement.querySelector('path, circle, rect, ellipse, line, polyline, polygon');
  if (firstElement) {
    return getColorFromElement(firstElement);
  }

  return getColorFromElement(svgElement);
}
