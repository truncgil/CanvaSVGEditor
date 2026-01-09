import { parseSVG } from './svgParser';

/**
 * SVG'yi parçalarına ayırır (ungroup işlemi)
 * Path elementlerini ve group elementlerini ayrı SVG'lere dönüştürür
 */
export function splitSVG(svgString: string): string[] {
  const parsed = parseSVG(svgString);
  const svgStrings: string[] = [];

  // Her elementi ayrı bir SVG string'ine dönüştür
  parsed.elements.forEach((element) => {
    svgStrings.push(element.svgString);
  });

  return svgStrings;
}

/**
 * SVG içindeki group elementlerini ungroup eder
 * Group içindeki tüm elementleri düz bir liste haline getirir
 */
export function ungroupSVG(svgString: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = doc.documentElement;

  if (!svgElement || svgElement.tagName !== 'svg') {
    throw new Error('Geçerli bir SVG elementi bulunamadı');
  }

  const viewBox = svgElement.getAttribute('viewBox') || undefined;
  const width = svgElement.getAttribute('width') || undefined;
  const height = svgElement.getAttribute('height') || undefined;
  const xmlns = svgElement.getAttribute('xmlns') || 'http://www.w3.org/2000/svg';

  const elements: Element[] = [];

  // Recursive olarak group elementlerini çöz
  const ungroupRecursive = (parent: Element) => {
    Array.from(parent.children).forEach((child) => {
      if (child.tagName.toLowerCase() === 'g') {
        // Group elementi - içindeki elementleri recursive olarak topla
        ungroupRecursive(child);
      } else {
        // Normal element - listeye ekle
        elements.push(child);
      }
    });
  };

  ungroupRecursive(svgElement);

  // Her elementi ayrı bir SVG string'ine dönüştür
  const serializer = new XMLSerializer();
  return elements.map((element) => {
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

    const clonedElement = element.cloneNode(true) as Element;
    svg.appendChild(clonedElement);

    return serializer.serializeToString(svg);
  });
}

/**
 * SVG'yi hem path hem de group elementlerine ayırır
 */
export function splitSVGComprehensive(svgString: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = doc.documentElement;

  if (!svgElement || svgElement.tagName !== 'svg') {
    throw new Error('Geçerli bir SVG elementi bulunamadı');
  }

  const viewBox = svgElement.getAttribute('viewBox') || undefined;
  const width = svgElement.getAttribute('width') || undefined;
  const height = svgElement.getAttribute('height') || undefined;
  const xmlns = svgElement.getAttribute('xmlns') || 'http://www.w3.org/2000/svg';

  const elements: Element[] = [];

  // Tüm elementleri topla (group'ları da dahil)
  const collectAllElements = (parent: Element) => {
    Array.from(parent.children).forEach((child) => {
      const tagName = child.tagName.toLowerCase();
      
      if (tagName === 'g') {
        // Group içindeki elementleri recursive olarak topla
        collectAllElements(child);
      } else {
        // Path, circle, rect vb. elementleri topla
        elements.push(child);
      }
    });
  };

  collectAllElements(svgElement);

  // Her elementi ayrı bir SVG string'ine dönüştür
  const serializer = new XMLSerializer();
  return elements.map((element) => {
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

    const clonedElement = element.cloneNode(true) as Element;
    svg.appendChild(clonedElement);

    return serializer.serializeToString(svg);
  });
}
