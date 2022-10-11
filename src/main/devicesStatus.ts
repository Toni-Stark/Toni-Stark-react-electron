import { ipcMain } from 'electron';
import { exec } from 'child_process';

export const devicesStatus = () => {
  ipcMain.on('run-devices', async (_event, arg) => {
    console.log('event', arg[1]);
    if (arg[0] === 'run') {
      console.log('-----------------------run-devices---------------------');
      exec('scrcpy');
    }
  });
};
