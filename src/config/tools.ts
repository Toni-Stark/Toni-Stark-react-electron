export const disposeMessage = (str?: string) => {
  return str?.split('[adbStr:')[1].split(']')[0];
};
export const evalMessage = (str?: string) => {
  return str?.split('[adbStr:')[0];
};
