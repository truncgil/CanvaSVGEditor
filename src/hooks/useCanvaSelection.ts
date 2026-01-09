import { useState, useEffect, useCallback } from 'react';
import { selection, design } from '@canva/design-api';

export interface CanvaElement {
  id: string;
  type: string;
  svgString?: string;
  url?: string;
}

/**
 * Canva seçim yönetimi için hook
 */
export function useCanvaSelection() {
  const [selectedElements, setSelectedElements] = useState<CanvaElement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Seçili elementleri okur
   */
  const readSelection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentSelection = await selection.get();
      
      if (!currentSelection || currentSelection.length === 0) {
        setSelectedElements([]);
        return [];
      }

      const elements: CanvaElement[] = [];

      for (const element of currentSelection) {
        // Element tipine göre SVG string'ini al
        let svgString: string | undefined;
        let url: string | undefined;

        if (element.type === 'IMAGE' || element.type === 'SVG') {
          // Image veya SVG elementleri için URL al
          try {
            const imageData = await design.getImageData(element.id);
            url = imageData?.url;
          } catch (err) {
            console.warn('Image data alınamadı:', err);
          }
        }

        elements.push({
          id: element.id,
          type: element.type,
          svgString,
          url,
        });
      }

      setSelectedElements(elements);
      return elements;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      console.error('Seçim okuma hatası:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Seçili elementleri günceller
   */
  const updateSelection = useCallback(async (elementIds: string[]) => {
    try {
      setIsLoading(true);
      setError(null);

      await selection.set(elementIds);
      await readSelection();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      console.error('Seçim güncelleme hatası:', err);
    } finally {
      setIsLoading(false);
    }
  }, [readSelection]);

  /**
   * Yeni SVG elementleri oluşturur
   */
  const createSVGElements = useCallback(async (svgStrings: string[]): Promise<string[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const createdIds: string[] = [];

      for (const svgString of svgStrings) {
        try {
          // SVG string'ini data URL'ye dönüştür
          const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
          
          // Canva'ya SVG ekle
          const result = await design.addImage({
            url: dataUrl,
            type: 'SVG',
          });

          if (result && result.id) {
            createdIds.push(result.id);
          }
        } catch (err) {
          console.error('SVG oluşturma hatası:', err);
        }
      }

      // Yeni oluşturulan elementleri seç
      if (createdIds.length > 0) {
        await selection.set(createdIds);
        await readSelection();
      }

      return createdIds;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      console.error('SVG element oluşturma hatası:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [readSelection]);

  /**
   * Seçili elementleri siler
   */
  const deleteSelection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentSelection = await selection.get();
      if (currentSelection && currentSelection.length > 0) {
        const ids = currentSelection.map((el) => el.id);
        await design.delete(ids);
        setSelectedElements([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      console.error('Silme hatası:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Seçili elementin SVG string'ini alır
   */
  const getSelectedSVGString = useCallback(async (): Promise<string | null> => {
    try {
      const currentSelection = await selection.get();
      
      if (!currentSelection || currentSelection.length === 0) {
        return null;
      }

      const firstElement = currentSelection[0];
      
      if (firstElement.type === 'SVG' || firstElement.type === 'IMAGE') {
        try {
          const imageData = await design.getImageData(firstElement.id);
          if (imageData?.url) {
            // URL'den SVG string'ini al
            const response = await fetch(imageData.url);
            const svgText = await response.text();
            return svgText;
          }
        } catch (err) {
          console.error('SVG string alma hatası:', err);
        }
      }

      return null;
    } catch (err) {
      console.error('Seçim okuma hatası:', err);
      return null;
    }
  }, []);

  // Seçim değişikliklerini dinle
  useEffect(() => {
    const handleSelectionChange = () => {
      readSelection();
    };

    // Canva selection event listener (eğer mevcutsa)
    // Not: Canva API'nin selection change event'i olup olmadığını kontrol etmek gerekebilir
    readSelection();

    return () => {
      // Cleanup
    };
  }, [readSelection]);

  return {
    selectedElements,
    isLoading,
    error,
    readSelection,
    updateSelection,
    createSVGElements,
    deleteSelection,
    getSelectedSVGString,
  };
}
