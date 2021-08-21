let child = require('child_process'), fs = require('fs'), path = require('path');
let {join} = path;

let root = join(__dirname, "../..");
let packagePath = join(root, "/package-wj")
let clientPath = 'client/'
let modulePath = join(clientPath, 'modules/')

let tsModulePaths = require(join(root, 'tsconfig.json')).compilerOptions.paths
tsModulePaths = JSON.parse(JSON.stringify(tsModulePaths).replace(/package-wj\/client\//g, ''));

class Dir {
  constructor(name) {
    this.name = name;
    this.dir = join(packagePath, modulePath, name)
  }
}

let info = [
  '.eslintrc.js',
  '.npmrc',
  '.prettierignore',
  '.prettierrc.toml',
  '.stylelintrc.yaml',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tsconfig.json',
  'tsconfig.typedoc.json',
].map(f=>join('client',f))

let packages = [
  'cm-lang-ftml',
  'cm-nspell',
  'cm-tarnation',
  'ftml-wasm-worker',
  'ftml-wasm',
  'sheaf',
  'threads-worker-module',
  'wj-codemirror',
  'wj-components',
  'wj-css',
  'wj-prism',
  'wj-state',
  'wj-util',
].map(pkg => new Dir(pkg))

function run(cmd, args, wd = root, { shell = false } = {}) {
  return child.execFileSync(cmd, args, {shell, cwd: wd, encoding: "utf8", stdio: ["ignore", "pipe", process.stderr]})
}

function install(arg = null) {
  let origin = arg == "--ssh" ? "git@github.com:scpwiki/wikijump.git" : "https://github.com/scpwiki/wikijump.git"
  if (!fs.existsSync(packagePath)) {
    run("git", ["clone", "--depth=1", "--filter=blob:none", origin, packagePath])
    // run("git", ["sparse-checkout", "set", clientPath], packagePath)
    run("git", ["pull", "--depth=1", "origin", "develop"], packagePath)
  }

  const relTsModulePath = join(packagePath, clientPath, 'tsconfig.json')
  let relTsModule = require(relTsModulePath)
  relTsModule.compilerOptions.paths = {...relTsModule.compilerOptions.paths, ...tsModulePaths}
  fs.writeFileSync(relTsModulePath, JSON.stringify(relTsModule, null, 2), 'utf8')



  // const pnpm = `packages
  //   - 'modules/*`

  // fs.writeFileSync(join(packagePath, 'client/pnpm-workspace.yaml'), pnpm, 'utf8')
}


install();
