import { ipcMain } from 'electron';
import { exec } from 'child_process';
import { mainWindow } from './main';

let logcat: any;
let pid: any = '';
let newTime: any = null;
export const startLogcat = () => {
  if (!newTime) {
    newTime = new Date().getTime();
  }
  console.log(newTime);
  ipcMain.on('ipc-logcat', async (_event, arg) => {
    if (arg[2] === 'kill') {
      console.log('-----------------------kill-server---------------------');
      exec('adb logcat -c');
    } else if (arg[1] === 'adb logcat') {
      if (!pid) {
        logcat = exec(arg[1], {
          maxBuffer: 10000000000,
          killSignal: 'SIGKILL',
        });
        logcat.stdout.on('data', (data: any) => {
          mainWindow?.webContents.send('listen-logcat', [
            `${data}`,
            `${arg[1]}`,
            `${arg[2]}`,
          ]);
          pid = logcat.pid;
        });
      }
    }
  });
};
