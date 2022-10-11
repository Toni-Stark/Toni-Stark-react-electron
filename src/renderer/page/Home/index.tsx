import { useEffect, useMemo, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { ArrayType, TabType } from '../../../config/types';
import './index.css';
import { disposeMessage, evalMessage } from '../../../config/tools';
// import { useNavigate } from 'react-router-dom';

const imageDelete = require('../../../assets/delete.png');
const imageStop = require('../../../assets/stop.png');
const defaultValue = '请选择设备';

export const Home = () => {
  // const navigate = useNavigate();
  const [selectList, setSelectList] = useState<ArrayType>([defaultValue]);
  const [tabList] = useState<TabType>(['应用列表', '应用权限', '应用日志']);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [consoleList, setConsoleList] = useState<Array<any>>([]);
  const [logcatList, setLogcatList] = useState<Array<any>>([]);
  const [connectStr, setConnectStr] = useState<string>('');
  const [adbStr, setAdbStr] = useState<string>('');
  const [packageList, setPackageList] = useState<Array<string>>([]);
  const [footerHeight, setFooterHeight] = useState<string | number>('');
  const [centerHeight, setCenterHeight] = useState<string | number>('');
  const [declaredList, setDeclaredList] = useState<Array<any>>([]);
  const [requestedList, setRequestedList] = useState<Array<any>>([]);
  const [installList, setInstallList] = useState<Array<any>>([]);
  const [runtimeList, setRuntimeList] = useState<Array<any>>([]);
  const [currentStr, setCurrentStr] = useState<string>('');
  const [endOfCat, setEndOfCat] = useState<boolean>(false);
  const consoleChildRef = useRef<any>();
  const logcatChildRef = useRef<any>();
  const startFooter = useRef<any>();
  const startRef = useRef<any>();
  const adbRef = useRef<any>();

  useEffect(() => {
    window.electron.ipcRenderer.on('listen-logcat', (eventStr: any[]) => {
      const event = eventStr;
      let obj = {
        adb: event[1],
        result: event[0],
      };
      logcatList.push(obj);
      setLogcatList([...logcatList]);
    });
    return () => {
      killServer();
    };
  }, []);
  useEffect(() => {
    window.electron.ipcRenderer.on('lc-active', (eventStr: any[]) => {
      const event = eventStr;
      if (event && event.length > 0) {
        switch (event[2]) {
          case 'get-brand':
            let list: any = event[0].split('\r\n').filter((item: any) => item);
            if (typeof list[0] === 'string' && /offline/.test(list[0])) {
              toast('连接超时...');
            } else if (
              typeof list[0] === 'string' &&
              /no devices/.test(list[0])
            ) {
              toast('没有检测到连接设备，请确认USB接口正常');
            } else {
              setSelectList(list);
              getPackageInfo(list);
            }
            break;
          case 'get-package':
            setPackageList([
              ...event[0].split('\r\n').filter((item: any) => item),
            ]);
            break;
          case 'set-content':
            toast(event[0]);
            break;
          case 'open-link':
            let obj = {
              adb: event[1],
              result: event[0],
            };
            consoleList.push(obj);
            setConsoleList([...consoleList]);
            setAdbStr('');
        }
      }
    });
  }, []);
  useEffect(() => {
    window.electron.ipcRenderer.on('devices-status', (eventStr: any[]) => {
      console.log(eventStr);
    });
  }, []);
  const openLink = () => {
    window.electron.ipcRenderer.sendMessage('ipc-example', [
      'lc-active',
      'adb shell getprop ro.product.model',
      'get-brand',
    ]);
  };

  const setConnect = () => {
    if (connectStr.trim().length > 0) {
      window.electron.ipcRenderer.sendMessage('ipc-example', [
        'lc-active',
        `adb connect ${connectStr}`,
        'set-content',
      ]);
    } else {
      toast('请先输入域名');
    }
  };

  const killServer = () => {
    window.electron.ipcRenderer.sendMessage('ipc-logcat', [
      'lc-active',
      'kill',
      'kill',
    ]);
  };
  const killAdb = () => {
    window.electron.ipcRenderer.sendMessage('ipc-example', [
      'ipc-example',
      'kill',
      'kill',
    ]);
  };
  const setScreenHeight = () => {
    if (startRef?.current?.scrollHeight) {
      const height: number = startRef?.current.scrollHeight;
      height && setFooterHeight(height - 83 - height / 2);
      height && setCenterHeight(height / 2);
    }
  };

  const setStr = (str: string, str1: any, str2: any) => {
    let list: Array<any> = [];
    console.log(str);
    str[0]
      ?.split(str1)[1]
      ?.split(str2)[0]
      ?.split('\r\n')
      ?.map((item: string) => {
        if (item?.length > 10) {
          list.push(item?.trim());
        }
      });
    return list;
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('get-permission', (event: any) => {
      let str: string = event;
      let declared = setStr(
        str,
        'declared permissions:',
        'requested permissions:'
      );
      let requested = setStr(
        str,
        'requested permissions:',
        'install permissions:'
      );
      let install = setStr(str, 'install permissions:', 'runtime permissions:');
      let runtime = setStr(str, 'runtime permissions:', 'Queries:');
      declared && setDeclaredList(declared);
      requested && setRequestedList(requested);
      install && setInstallList(install);
      runtime && setRuntimeList(runtime);
    });
  }, []);

  useEffect(() => {
    openLink();
    setScreenHeight();
    window.addEventListener('resize', () => {
      setScreenHeight();
    });
  }, []);
  useEffect(() => {
    let obj: any;
    window.electron.ipcRenderer.on('lc-active', (event: any) => {
      obj = {
        adb: disposeMessage(event?.toString()),
        result: evalMessage(event?.toString()),
      };
      setConsoleList([...consoleList, obj]);
      setAdbStr('');
    });
  });
  useEffect(() => {
    const currentChild = logcatChildRef && logcatChildRef.current;
    if (currentChild?.scrollHeight)
      currentChild.scrollTop = currentChild.scrollHeight;
  }, [logcatList]);
  useEffect(() => {
    const currentChild = consoleChildRef && consoleChildRef.current;
    if (currentChild?.scrollHeight)
      currentChild.scrollTop = currentChild.scrollHeight;
  }, [consoleList]);

  const currentIp = (e: any) => {
    setConnectStr(e.target.value);
  };
  const currentAdb = (e: any) => {
    setAdbStr(e.target.value);
  };
  const runAdb = () => {
    if (adbStr.trim().length > 0) {
      if (adbStr === 'adb logcat') {
        getLogcatInfo();
      } else {
        window.electron.ipcRenderer.sendMessage('ipc-example', [
          'lc-active',
          `${adbStr}`,
          'open-link',
        ]);
      }
    } else {
      toast('请先输入命令');
    }
  };
  const getPackageInfo = (event?: Array<any>) => {
    if (
      selectList[0] !== defaultValue ||
      (event && event[0] !== defaultValue)
    ) {
      window.electron.ipcRenderer.sendMessage('ipc-example', [
        'lc-active',
        'adb shell pm list package -3',
        'get-package',
      ]);
    }
  };
  const getLogcatInfo = () => {
    setCurrentTab(2);
    setEndOfCat(true);
    window.electron.ipcRenderer.sendMessage('ipc-logcat', [
      'listen-logcat',
      'adb logcat',
      'get-logcat',
    ]);
  };

  const getPackageList = (index: number) => {
    if (selectList[0] === defaultValue) toast('请连接设备');
    setCurrentTab(index);
    // setLogcatList([]);
    setConsoleList([]);
    if (index === 0) getPackageInfo();
    if (endOfCat && index !== 2) {
      setEndOfCat(false);
      killServer();
    }
    if (index === 2) {
      getLogcatInfo();
    }
  };

  const calAge = (e: any) => {
    var evt = window.event || e;
    if (evt.keyCode == 13) {
      runAdb();
    }
  };

  const deleteConsole = () => {
    setConsoleList([]);
  };

  const stopConsole = () => {
    killServer();
    killAdb();
  };
  const runDevices = () => {
    // E:\electron\scrcpy.exe
    window.electron.ipcRenderer.sendMessage('run-devices', [
      'run',
      'scrcpy',
      'devices-stauts',
    ]);
  };

  const getFocus = () => {
    adbRef.current.focus();
  };

  const naviToPermissions = (e: string) => {
    setCurrentTab(1);
    setCurrentStr(e?.split(':')[1]);
    window.electron.ipcRenderer.sendMessage('ipc-example', [
      'get-permission',
      `adb shell "dumpsys package ${e?.split(':')[1]}`,
      'get-permission',
    ]);
  };

  const currentOptions = useMemo(() => {
    return (
      <select name="" id="" className="label view" defaultValue={selectList[0]}>
        {selectList.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
        {selectList.length === 0 ? (
          <option key={defaultValue} value={defaultValue} disabled>
            {defaultValue}
          </option>
        ) : null}
      </select>
    );
  }, [selectList]);

  const currentDeclared = useMemo(() => {
    return (
      <div className="declared-list permissions-list">
        <div className="permissions-title">敏感权限：</div>
        {declaredList.map((item, index) => (
          <div key={index + Math.random() * 10000}>{item}</div>
        ))}
      </div>
    );
  }, [declaredList]);
  const currentRequested = useMemo(() => {
    return (
      <div className="declared-list permissions-list">
        <div className="permissions-title">请求的权限：</div>
        {requestedList.map((item, index) => (
          <div key={index + Math.random() * 10000}>{item}</div>
        ))}
      </div>
    );
  }, [requestedList]);
  const currentInstall = useMemo(() => {
    return (
      <div className="declared-list permissions-list">
        <div className="permissions-title">安装权限：</div>
        {installList.map((item, index) => (
          <div key={index + Math.random() * 10000}>{item}</div>
        ))}
      </div>
    );
  }, [installList]);
  const currentRuntime = useMemo(() => {
    return (
      <div className="declared-list permissions-list">
        <div className="permissions-title">运行时的权限：</div>
        {runtimeList.map((item, index) => (
          <div key={index + Math.random() * 10000}>{item}</div>
        ))}
      </div>
    );
  }, [runtimeList]);

  const currentContext = useMemo(() => {
    switch (currentTab) {
      case 0:
        return (
          <div className="package-name">
            {packageList.map((item) => (
              <div key={item} className="package-item">
                {item}
                <div className="package-control">
                  <div onClick={() => naviToPermissions(item)}>权限设置</div>
                  {/*<div>应用日志</div>*/}
                </div>
              </div>
            ))}
          </div>
        );
      case 1:
        return (
          <div className="main-permission">
            <div>包名：{currentStr}</div>
            {currentDeclared}
            {currentRequested}
            {currentInstall}
            {currentRuntime}
          </div>
        );
      case 2:
        return (
          <div className="logcat-result" ref={logcatChildRef}>
            {logcatList.map((item) => {
              return (
                <div
                  className="footer-result"
                  key={item.adb + Math.random() * 10000}
                >
                  <div>输入：{item.adb}</div>
                  {item.result ? <div>结果：{item.result}</div> : null}
                  {item.error ? (
                    <div>发生错误：{item.error.message}</div>
                  ) : null}
                  {item.console ? <div>输出：{item.console}</div> : null}
                </div>
              );
            })}
          </div>
        );
      default:
        return null;
        break;
    }
  }, [
    packageList,
    logcatList,
    currentTab,
    declaredList,
    requestedList,
    installList,
    runtimeList,
  ]);

  const currentConsole = useMemo(() => {
    return (
      <div className="footer-view" ref={consoleChildRef} onClick={getFocus}>
        {consoleList.map((item) => {
          return (
            <div
              className="footer-result"
              key={item.adb + Math.random() * 10000}
            >
              <div>输入：{item.adb}</div>
              {item.result ? <div>结果：{item.result}</div> : null}
              {item.error ? <div>发生错误：{item.error.message}</div> : null}
              {item.console ? <div>输出：{item.console}</div> : null}
            </div>
          );
        })}
        <div className="input-view">
          <input
            placeholder=""
            ref={adbRef}
            value={adbStr}
            onChange={currentAdb}
            onKeyDown={calAge}
            type="text"
          />
        </div>
      </div>
    );
  }, [consoleList, adbStr]);
  return (
    <div className="container">
      <div className="header">
        <div className="devices">
          {currentOptions}
          <input
            className="label"
            value={connectStr}
            type="text"
            placeholder="请输入IP"
            onChange={currentIp}
          />
        </div>
        <div className="devices eval-devices view">
          <button type="button" onClick={openLink}>
            刷新域名
          </button>
          <button type="button" onClick={setConnect}>
            连接设备
          </button>
        </div>
        <div className="devices">
          <button type="button" className="devices-control">
            设置代理
          </button>
        </div>
        <div className="devices">
          <button type="button" className="devices-control">
            还原设置
          </button>
        </div>
        <div className="devices">
          <button
            type="button"
            className="devices-control"
            onClick={runDevices}
          >
            启动手机
          </button>
        </div>
      </div>
      <div className="content">
        <div className="content-start" ref={startRef}>
          <div className="content-tab">
            {tabList.map((item, index) => (
              <div
                key={item}
                className={
                  index === currentTab
                    ? 'content-item tab-active'
                    : 'content-item'
                }
                onClick={() => getPackageList(index)}
              >
                {item}
              </div>
            ))}
          </div>
          <div
            className="content-center"
            style={{ maxHeight: centerHeight || '50%' }}
          >
            {currentContext}
          </div>
          <div
            className="content-footer"
            style={{ maxHeight: footerHeight || '50%' }}
            ref={startFooter}
          >
            <div className="content-config">
              <img src={imageDelete} alt="" onClick={deleteConsole} />
              <img src={imageStop} alt="" onClick={stopConsole} />
            </div>
            {currentConsole}
          </div>
        </div>
        <div />
      </div>
      <ToastContainer />
    </div>
  );
};
