import { useState, useEffect, useCallback } from 'react';
import { selection } from '@canva/design';

export interface CanvaElement {
  id: string;
  type: string;
  svgString?: string;
  url?: string;
  ref?: string;
}

/**
 * Canva seçim yönetimi için hook
 * Not: Canva'nın yeni API'si event-based çalışıyor
 */
export function useCanvaSelection() {
  const [selectedElements, setSelectedElements] = useState<CanvaElement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Seçili elementleri okur
   */
  const readSelection = useCallback(async () => {
    // Selection event-based çalışıyor, bu metod selection event'lerinden gelen data'yı döndürür
    return selectedElements;
  }, [selectedElements]);

  /**
   * Seçili elementleri günceller
   */
  const updateSelection = useCallback(async (_elementIds: string[]) => {
    // Canva'nın yeni API'sinde selection.set() yok
    // Selection event-based çalışıyor
    // eslint-disable-next-line no-console
    console.warn('Selection update is handled by Canva selection events');
  }, []);

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
          const _dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
          
          // Canva'ya SVG ekle - yeni API'de addNativeElement kullanılabilir
          // Şimdilik placeholder - Canva dokümantasyonuna göre güncellenmeli
          // eslint-disable-next-line no-console
          console.warn('SVG ekleme API\'si güncellenmeli - addNativeElement kullanılabilir');
          
          // TODO: addNativeElement ile SVG ekleme implementasyonu
          // const result = await addNativeElement({...});
          void _dataUrl; // Suppress unused variable warning
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('SVG oluşturma hatası:', err);
        }
      }

      return createdIds;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error('SVG element oluşturma hatası:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Seçili elementleri siler
   */
  const deleteSelection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // eslint-disable-next-line no-console
      console.warn('Delete functionality needs to be updated for new Canva API');
      setSelectedElements([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      // eslint-disable-next-line no-console
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
      const firstElement = selectedElements[0];
      if (firstElement && firstElement.url) {
        const response = await fetch(firstElement.url);
        const svgText = await response.text();
        return svgText;
      }
      return null;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('SVG string alma hatası:', err);
      return null;
    }
  }, [selectedElements]);

  // Selection event'lerini dinle
  useEffect(() => {
    const unsubscribe = selection.registerOnChange({
      scope: 'image',
      onChange: async (event) => {
        if (event.count > 0) {
          try {
            const draft = await event.read();
            const elements: CanvaElement[] = [];
            
            for (const content of draft.contents) {
              if ('ref' in content) {
                elements.push({
                  id: content.ref,
                  type: 'IMAGE',
                  ref: content.ref,
                });
              }
            }
            
            setSelectedElements(elements);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Selection read hatası:', err);
          }
        } else {
          setSelectedElements([]);
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
