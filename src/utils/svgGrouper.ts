/**
 * Birden fazla SVG string'ini tek bir grup SVG'sine dönüştürür
 */
export function groupSVGs(svgStrings: string[]): string {
  if (svgStrings.length === 0) {
    throw new Error('En az bir SVG gerekli');
  }

  if (svgStrings.length === 1) {
    return svgStrings[0];
  }

  const parser = new DOMParser();
  const firstDoc = parser.parseFromString(svgStrings[0], 'image/svg+xml');
  const firstSvg = firstDoc.documentElement;

  if (!firstSvg || firstSvg.tagName !== 'svg') {
    throw new Error('Geçerli bir SVG elementi bulunamadı');
  }

  const viewBox = firstSvg.getAttribute('viewBox') || undefined;
  const width = firstSvg.getAttribute('width') || undefined;
  const height = firstSvg.getAttribute('height') || undefined;
  const xmlns = firstSvg.getAttribute('xmlns') || 'http://www.w3.org/2000/svg';

  // Yeni SVG oluştur
  const newSvg = document.createElementNS(xmlns, 'svg');
  
  if (viewBox) {
    newSvg.setAttribute('viewBox', viewBox);
  }
  if (width) {
    newSvg.setAttribute('width', width);
  }
  if (height) {
    newSvg.setAttribute('height', height);
  }
  newSvg.setAttribute('xmlns', xmlns);

  // Group elementi oluştur
  const group = document.createElementNS(xmlns, 'g');
  group.setAttribute('id', 'svg-group');

  // Her SVG string'ini parse et ve içindeki elementleri group'a ekle
  svgStrings.forEach((svgString) => {
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.documentElement;

    if (svg && svg.tagName === 'svg') {
      Array.from(svg.children).forEach((child) => {
        const clonedChild = child.cloneNode(true) as Element;
        group.appendChild(clonedChild);
      });
    }
  });

  newSvg.appendChild(group);

  // SVG string'ine dönüştür
  const serializer = new XMLSerializer();
  return serializer.serializeToString(newSvg);
}

/**
 * SVG string'lerini birleştirir (group olmadan)
 */
export function mergeSVGs(svgStrings: string[]): string {
  if (svgStrings.length === 0) {
    throw new Error('En az bir SVG gerekli');
  }

  if (svgStrings.length === 1) {
    return svgStrings[0];
  }

  const parser = new DOMParser();
  const firstDoc = parser.parseFromString(svgStrings[0], 'image/svg+xml');
  const firstSvg = firstDoc.documentElement;

  if (!firstSvg || firstSvg.tagName !== 'svg') {
    throw new Error('Geçerli bir SVG elementi bulunamadı');
  }

  const viewBox = firstSvg.getAttribute('viewBox') || undefined;
  const width = firstSvg.getAttribute('width') || undefined;
  const height = firstSvg.getAttribute('height') || undefined;
  const xmlns = firstSvg.getAttribute('xmlns') || 'http://www.w3.org/2000/svg';

  // Yeni SVG oluştur
  const newSvg = document.createElementNS(xmlns, 'svg');
  
  if (viewBox) {
    newSvg.setAttribute('viewBox', viewBox);
  }
  if (width) {
    newSvg.setAttribute('width', width);
  }
  if (height) {
    newSvg.setAttribute('height', height);
  }
  newSvg.setAttribute('xmlns', xmlns);

  // Her SVG string'ini parse et ve içindeki elementleri direkt SVG'ye ekle
  svgStrings.forEach((svgString) => {
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.documentElement;

    if (svg && svg.tagName === 'svg') {
      Array.from(svg.children).forEach((child) => {
        const clonedChild = child.cloneNode(true) as Element;
        newSvg.appendChild(clonedChild);
      });
    }
  });

  // SVG string'ine dönüştür
  const serializer = new XMLSerializer();
  return serializer.serializeToString(newSvg);
}
