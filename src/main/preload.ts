import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = string;

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: any[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (args: any[]) => void) {
      const subscription = (_event: IpcRendererEvent, args: any[]) => {
        func(args);
      };
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (args: string) => void) {
      ipcRenderer.once(channel, (_event, args) => args && func(args));
    },
    removeListener(channel: string, subscription: (...args: any[]) => void) {
      ipcRenderer.removeListener(channel, subscription);
    },
  },
});
