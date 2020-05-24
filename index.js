const fs = require('fs');
const path = require('path');
const WD = require('./wd.js');
var config = {
  "site": ["scpsandboxcn"],
  "source": "./Wikidot/"
}
try {
  const cnfg = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
  config = Object.assign(config, cnfg);
} catch (e) {
  if (!["ENOENT".includes(e.code)]) throw e
}
//const sGit = require('simple-git')(config.source);

let dir = fs.readdirSync(config.source)
            .filter(f => fs.statSync(path.join(config.source,f)).isDirectory()&&config.site.includes(f));
for (let s of config.site) {
  if (!dir.includes(s)) {
    fs.mkdirSync(path.join(config.source, s));
  }
}
const wd = new WD(config.site.map(s=>`http://${s}.wikidot.com`));

!(async ()=>{
  await wd.askLogin();

  for (let s of dir) {
    let pages = fs.readdirSync(path.join(config.source,s))
                  .filter(f => fs.statSync(path.join(config.source,s,f)).isFile());
    pages.forEach(p=>{
      let raw = fs.readFileSync(path.join(config.source,s,p), 'utf-8')
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
      wd.edit(`http://${s}.wikidot.com`, p.replace(/~/g,':').split(".")[0], info).then(
        ()=>{console.log(`Successfully pushed ${p} to http://${s}.wikidot.com/${p.replace(/~/g,':').split(".")[0]}`)}
      ).catch(e=>console.log(e));
    })
  }
})().catch(e=>{throw e})
