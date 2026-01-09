import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcutHandlers {
  onSplit?: () => void;
  onGroup?: () => void;
}

/**
 * Klavye kısayolları için hook
 * Ctrl+U: SVG parçalama
 * Ctrl+G: SVG gruplama
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const handlersRef = useRef(handlers);

  // Handler'ları güncelle
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ctrl (veya Cmd on Mac) tuşuna basılı mı kontrol et
    const isModifierPressed = event.ctrlKey || event.metaKey;

    if (!isModifierPressed) {
      return;
    }

    // Ctrl+U: Parçalama
    if (event.key === 'u' || event.key === 'U') {
      event.preventDefault();
      event.stopPropagation();
      
      if (handlersRef.current.onSplit) {
        handlersRef.current.onSplit();
      }
      return;
    }

    // Ctrl+G: Gruplama
    if (event.key === 'g' || event.key === 'G') {
      event.preventDefault();
      event.stopPropagation();
      
      if (handlersRef.current.onGroup) {
        handlersRef.current.onGroup();
      }
      return;
    }
  }, []);

  useEffect(() => {
    // Global keyboard event listener ekle
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      // Cleanup
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);
}

/**
 * Klavye kısayolları bilgisini döndürür
 */
export function getKeyboardShortcutsInfo(): Array<{ key: string; description: string }> {
  return [
    { key: 'Ctrl+U', description: 'SVG\'yi parçalarına ayır' },
    { key: 'Ctrl+G', description: 'Seçili elementleri grupla' },
  ];
}
