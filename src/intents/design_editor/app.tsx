import { SVGEditor } from "../../components/SVGEditor";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { useCanvaSelection } from "../../hooks/useCanvaSelection";
import { splitSVGComprehensive } from "../../utils/svgSplitter";
import { groupSVGs } from "../../utils/svgGrouper";
import React from "react";

export function App() {
  const {
    selectedElements,
    getSelectedSVGString,
    createSVGElements,
  } = useCanvaSelection();

  // SVG parçalama handler'ı
  const handleSplit = React.useCallback(async () => {
    const svgString = await getSelectedSVGString();
    if (!svgString) {
      return;
    }

    try {
      const svgStrings = splitSVGComprehensive(svgString);
      if (svgStrings.length > 0) {
        await createSVGElements(svgStrings);
      }
    } catch (err) {
      console.error('Parçalama hatası:', err);
    }
  }, [getSelectedSVGString, createSVGElements]);

  // SVG gruplama handler'ı
  const handleGroup = React.useCallback(async () => {
    if (selectedElements.length < 2) {
      return;
    }

    try {
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

      if (svgStrings.length >= 2) {
        const groupedSVG = groupSVGs(svgStrings);
        await createSVGElements([groupedSVG]);
      }
    } catch (err) {
      console.error('Gruplama hatası:', err);
    }
  }, [selectedElements, createSVGElements]);

  // Klavye kısayollarını bağla
  useKeyboardShortcuts({
    onSplit: handleSplit,
    onGroup: handleGroup,
  });

  return <SVGEditor />;
}
