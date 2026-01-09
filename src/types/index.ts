export interface SVGElement {
  type: 'path' | 'group' | 'circle' | 'rect' | 'ellipse' | 'line' | 'polyline' | 'polygon' | 'text' | 'other';
  element: Element;
  svgString: string;
  attributes: Record<string, string>;
}

export interface ParsedSVG {
  elements: SVGElement[];
  viewBox?: string;
  width?: string;
  height?: string;
  xmlns?: string;
}

export interface ColorInfo {
  fill?: string;
  stroke?: string;
  fillOpacity?: string;
  strokeOpacity?: string;
}
