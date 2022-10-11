import { ipcMain } from 'electron';
import { exec } from 'child_process';
import { mainWindow } from './main';

let result: any;
export const startIpcMain = function () {
  ipcMain.on('ipc-example', async (_event, arg) => {
    result?.kill();
    result = null;
    if (arg[0] === 'get-permission') {
      exec(arg[1], (_e, info) => {
        mainWindow?.webContents.send(arg[0], [info]);
      });
    } else {
      result = exec(arg[1]);
      result.stdout?.on('data', (data: any) => {
        mainWindow?.webContents.send(arg[0], [
          `${data}`,
          `${arg[1]}`,
          `${arg[2]}`,
        ]);
      });
      result.stderr?.on('data', (data: any) => {
        mainWindow?.webContents.send(arg[0], [
          `${data}`,
          `${arg[1]}`,
          `${arg[2]}`,
        ]);
      });
    }
  });
};
