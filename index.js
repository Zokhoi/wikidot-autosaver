const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const WD = require('./wd.js');
const isFileExists = (name) => {
  try {
      fs.accessSync(name, fs.constants.R_OK);
      return true;
  } catch (err) {
      return false;
  }
}
var config = {
  "site": ["scp-sandbox-3"],
  "source": "./Wikidot/",
  "pages": {
    "scp-sandbox-3": "*"
  }
}
if (isFileExists(`config.yml`)) {
  config = yaml.load(fs.readFileSync(`config.yml`, 'utf8'));
} else if (isFileExists(`config.yaml`)) {
  config = yaml.load(fs.readFileSync(`config.yaml`, 'utf8'));
} else if (isFileExists(`config.js`)) {
  config = require(`./config.js`);
} else if (isFileExists(`config.json`)) {
  config = require(`./config.json`);
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
                    (!lastModified[s][f.replace(/~/g,':')] || stat.mtimeMs > lastModified[s][f.replace(/~/g,':')])
                  });
    if (typeof config.pages[s] == "string") {
      if (config.pages[s] !== "*") {
        pages = pages.filter(f => [f.split(".")[0], f.split(".")[0].replace(/~/g,':')].includes(config.pages[s]))
      }
    } else if (config.pages[s] instanceof Array) {
      pages = pages.filter(f => config.pages[s].includes(f.split(".")[0]) || config.pages[s].includes(f.split(".")[0].replace(/~/g,':')));
    }
    for (let p of pages) {
      let raw = fs.readFileSync(path.join(config.source,s,p), 'utf-8');
      lastModified[s][p] = fs.statSync(path.join(config.source,s,p)).mtimeMs;
      let info = {
        title: "",
        source: "",
        comments: "",
        tags: "",
        parentPage: "",
      }
      let sauce = raw.split(/~{4,}/);
      let tilde = raw.match(/~{4,}/gi);
      tilde.shift();
      let tmp = [];
      if (sauce.length===1) {
        info.source = raw;
      } else {
        let metadata = sauce.shift().split("\n").filter(v=>!!v);
        let placeholder = JSON.parse(JSON.stringify(metadata));
        for (let i = 0; i < sauce.length; i++) {
          if (sauce[i]) tmp.push(sauce[i]);
          if (tilde[i]) tmp.push(tilde[i]);
        }
        sauce = tmp.join("").split("\n");
        sauce.shift();
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
          } else if (ln.toLowerCase().startsWith("parent")) {
            placeholder.splice(placeholder.indexOf(ln), 1)
            info.parentPage = ln.substring("parent:".length).split(" ").filter(v=>!!v).join(" ").trim().replace(/~/g,':')
          }
        }
      }
      setTimeout(()=>{
        let err = null;
        wd.edit(s, p.replace(/~/g,':').split(".")[0], info)
          .catch(e=>{
          err = e;
          if (e.message!="Response code 500 (Internal Server Error)") {console.log(e.message)}
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
