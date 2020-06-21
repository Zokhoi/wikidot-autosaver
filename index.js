const fs = require('fs');
const path = require('path');
const WD = require('./wd.js');
var config = {
  "site": ["scp-sandbox-3"],
  "source": "./Wikidot/",
  "pages": {
    "scp-sandbox-3": "*"
  }
}
try {
  const cnfg = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
  config = Object.assign(config, cnfg);
} catch (e) {
  if (!["ENOENT"].includes(e.code)) throw e
}
//const sGit = require('simple-git')(config.source);
var lastModified = {};
let lmpath = path.join(config.source, '.lastModified.json');
if (fs.existsSync(lmpath)) {
  lastModified = JSON.parse(fs.readFileSync(lmpath, 'utf-8'));
} else {
  fs.writeFileSync(lmpath, '{}', 'utf-8');
}

let dir = fs.readdirSync(config.source)
            .filter(f => fs.statSync(path.join(config.source,f)).isDirectory()&&config.site.includes(f));
for (let s of config.site) {
  if (!lastModified[s]) { lastModified[s] = {} }
  if (!dir.includes(s)) { fs.mkdirSync(path.join(config.source, s)); }
}
const wd = new WD(config.site);

!(async ()=>{
  let tmp = true;
  while (tmp) {
    tmp = null;
    await wd.askLogin().catch(e=>{tmp=e; console.log(e.message)});
  }
  console.log("Successfully logged in.")
  let wait = 0;
  for (let s of dir) {
    let pages = fs.readdirSync(path.join(config.source,s))
                  .filter(f => {
                    let stat = fs.statSync(path.join(config.source,s,f))
                    return !!f.split(".")[0] && stat.isFile() &&
                    (!lastModified[s][f] || stat.mtimeMs > lastModified[s][f])
                  });
    if (typeof config.pages[s] == "string") {
      if (!config.pages[s] === "*") {
        pages = pages.filter(f => f.split(".")[0]===config.pages[s])
      }
    } else if (config.pages[s] instanceof Array) {
      pages = pages.filter(f => config.pages[s].includes(f.split(".")[0]));
    }
    for (let p of pages) {
      let raw = fs.readFileSync(path.join(config.source,s,p), 'utf-8');
      lastModified[s][p] = fs.statSync(path.join(config.source,s,p)).mtimeMs;
      let info = {
        title: "",
        source: "",
        comments: "",
        tags: ""
      }
      let sauce = raw.split("~~~~~~");
      if (sauce.length===1) {
        info.source = raw;
      } else {
        let metadata = raw.split("~~~~~~")[0].split("\n").filter(v=>!!v);
        let placeholder = JSON.parse(JSON.stringify(metadata));
        sauce.shift();
        sauce.join("~~~~~~").split("\n").shift();
        info.source = sauce.join("\n");
        for (let ln of metadata) {
          if (ln.toLowerCase().startsWith("title")) {
            placeholder.splice(placeholder.indexOf(ln), 1)
            info.title = ln.substring("title:".length).split(" ").filter(v=>!!v).join(" ")
          } else if (ln.toLowerCase().startsWith("tags")) {
            placeholder.splice(placeholder.indexOf(ln), 1)
            info.tags = ln.substring("tags:".length).split(" ").filter(v=>!!v).join(" ")
          } else if (ln.toLowerCase().startsWith("comments")) {
            placeholder.splice(placeholder.indexOf(ln), 1)
            placeholder.unshift(ln.substring("comments:".length).split(" ").filter(v=>!!v).join(" "))
            info.comments = placeholder.join("\n");
          }
        }
      }
      setTimeout(()=>{
        let err = null;
        wd.edit(s, p.replace(/~/g,':').split(".")[0], info)
          .catch(e=>{
          err = e
          if (!e.message==="Response code 500 (Internal Server Error)") {console.log(e.message)}
        })
        if (!err) {
          console.log(`Successfully posted to http://${s}.wikidot.com/${p.replace(/~/g,':').split(".")[0]}`);
        }
      }, (pages.indexOf(p)*3000+wait))
    }
    wait+=pages.length*3000;
  }
  fs.writeFileSync(lmpath,
    JSON.stringify(lastModified, null, 2), 'utf-8');
})().catch(e=>{throw e})
