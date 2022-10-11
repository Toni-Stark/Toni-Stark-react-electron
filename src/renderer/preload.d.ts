import { Channels } from 'main/preload';
import { ipcRenderer } from 'electron';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: any[]): void;
        on(
          channel: string,
          func: (args: any[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (args: string) => void): void;
        removeListener(
          channel: string,
          subscription: (...args: any[]) => void
        ): void;
      };
    };
  }
}

export {};
