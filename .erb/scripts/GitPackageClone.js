let child = require('child_process'), fs = require('fs'), path = require('path');
let {join} = path;

let root = join(__dirname, "../..");
let packagePath = join(root, "/package-wj")
let clientPath = 'client/'
let modulePath = join(clientPath, 'modules/')

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
    run("git", ["clone", "--depth=1", "--filter=blob:none", "--sparse", origin, packagePath])
    run("git", ["sparse-checkout", "set", clientPath], packagePath)
    run("git", ["pull", "--depth=1", "origin", "develop"], packagePath)
  }

  // const pnpm = `packages
  //   - 'modules/*`

  // fs.writeFileSync(join(packagePath, 'client/pnpm-workspace.yaml'), pnpm, 'utf8')

  for (let pkg of packages) {
    if (fs.existsSync(pkg.dir)) {
      run("yarn.cmd", ["install"], pkg.dir)
    } else {
      console.warn(`Skipping installing for ${pkg.name} (directory does not exist)`)
    }
  }
}


install();
