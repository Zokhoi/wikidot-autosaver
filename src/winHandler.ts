import Registry, { ProcessUncleanExitError } from 'winreg';
import { basename, join } from 'path';
// import { remote } from 'electron';

export const appName = 'Shuen';
const exeName = basename(process.execPath);
const appPath = `"${process.execPath}"`;
const fileIconPath = `"${join(
  process.execPath,
  'resources',
  'assets',
  'icons',
  '16x16.png'
)}"`;

class ShellOption {
  key: string;

  parts: Array<Record<string, unknown>>;

  constructor(key: string, parts: Array<Record<string, unknown>>) {
    this.isRegistered = this.isRegistered.bind(this);
    this.register = this.register.bind(this);
    this.deregister = this.deregister.bind(this);
    this.update = this.update.bind(this);
    this.key = key;
    this.parts = parts;
  }

  isRegistered(onFinish: (isRegesteredResult: boolean) => void) {
    new Registry({
      hive: 'HKCU',
      key: `${this.key}\\${this.parts[0].key}`,
    }).get(this.parts[0].name, (err, val) =>
      onFinish(err == null && val != null && val.value === this.parts[0].value)
    );
  }

  register(onFinish: () => void) {
    let doneCount = this.parts.length;
    this.parts.forEach((part) => {
      const reg = new Registry({
        hive: 'HKCU',
        key: part.key != null ? `${this.key}\\${part.key}` : this.key,
      });
      return reg.create(() =>
        reg.set(part.name, Registry.REG_SZ, part.value, () => {
          if (--doneCount === 0) return onFinish();
        })
      );
    });
  }

  deregister(onFinish: (wasRegistered: boolean) => void) {
    this.isRegistered((isRegistered) => {
      if (isRegistered) {
        new Registry({ hive: 'HKCU', key: this.key }).destroy(() =>
          onFinish(true)
        );
      } else {
        onFinish(false);
      }
    });
  }

  update(onFinish: (error?: ProcessUncleanExitError) => void) {
    new Registry({
      hive: 'HKCU',
      key: `${this.key}\\${this.parts[0].key}`,
    }).get(this.parts[0].name, (err, val) => {
      if (err != null || val == null) {
        onFinish(err);
      } else {
        this.register(onFinish);
      }
    });
  }
}

export const fileHandler = new ShellOption(
  `\\Software\\Classes\\Applications\\${exeName}`,
  [
    { key: 'shell\\open\\command', name: '', value: `${appPath} "%1"` },
    { key: 'shell\\open', name: 'FriendlyAppName', value: `${appName}` },
    { key: 'DefaultIcon', name: '', value: `${fileIconPath}` },
  ]
);

const contextParts = [
  { key: 'command', name: '', value: `${appPath} "%1"` },
  { name: '', value: `Open folder with ${appName}` },
  { name: 'Icon', value: `${appPath}` },
];

export const fileContextMenu = new ShellOption(
  `\\Software\\Classes\\*\\shell\\${appName}`,
  contextParts
);
export const folderContextMenu = new ShellOption(
  `\\Software\\Classes\\Directory\\shell\\${appName}`,
  contextParts
);
export const folderBackgroundContextMenu = new ShellOption(
  `\\Software\\Classes\\Directory\\background\\shell\\${appName}`,
  JSON.parse(JSON.stringify(contextParts).replace('%1', '%V'))
);
