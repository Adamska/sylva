'use client';

import { useEffect } from 'react';
import { useBotanyStore } from '@/store/useBotanyStore';
import { commandForKey } from './commands';

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
}

export function useShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const store = useBotanyStore.getState();
      const modifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (modifier && key === 'k') {
        event.preventDefault();
        store.setPaletteOpen(!store.paletteOpen);
        return;
      }
      if (event.key === 'Escape') {
        if (store.paletteOpen) store.setPaletteOpen(false);
        else if (store.catalogOpen) store.setCatalogOpen(false);
        else if (store.presenting) store.setPresenting(false);
        else if (store.evolving) store.setEvolving(false);
        return;
      }
      if (isTyping(event.target) || store.paletteOpen || store.catalogOpen) return;
      if (modifier && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if (modifier || event.altKey) return;
      if (event.key === '?') {
        store.setPaletteOpen(true);
        return;
      }
      const command = commandForKey(event.key);
      if (!command) return;
      event.preventDefault();
      command.run();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
