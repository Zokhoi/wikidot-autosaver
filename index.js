const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const fm = require('front-matter');
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

let sites = [];
for (let key in config.pages) { sites.push(key) }
let dir = fs.readdirSync(config.source)
            .filter(f => fs.statSync(path.join(config.source,f)).isDirectory()&&sites.includes(f));
for (let s of sites) {
  if (!lastModified[s]) { lastModified[s] = {} }
  if (!dir.includes(s)) { fs.mkdirSync(path.join(config.source, s)); }
}
const wd = new WD(sites);

!(async ()=>{
  let tmp = true;
  while (tmp) {
    tmp = null;
    await wd.askLogin().catch(e=>{tmp=e; console.log(e.message)});
  }
  console.log("Successfully logged in.")
  let queue = [];
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
      let info = {};
      let meta = { site: s, page: p.replace(/~/g,':').split(".")[0] };
      if (fm.test(raw)) {
        let content = fm(raw);
        if (content.attributes.title && typeof content.attributes.title == 'string') info.title = content.attributes.title;
        if (content.attributes.tags) {
          switch (typeof content.attributes.tags) {
            case 'string':
              info.tags = content.attributes.tags;
              break;
            case 'array':
              info.tags = " ".join(content.attributes.tags);
              break;
            default:
              info.tags = JSON.stringify(content.attributes.tags);
              break;
          }
        }
        if (content.attributes.parentPage && typeof content.attributes.parentPage == 'string') info.parentPage = content.attributes.parentPage;
        if (content.attributes.parent && typeof content.attributes.parent == 'string') info.parent = content.attributes.parent;
        if (content.attributes.comments && typeof content.attributes.comments == 'string') info.comments = content.attributes.comments;
        info.source = content.body;
        if (content.attributes.site && typeof content.attributes.site == 'string') meta.site = content.attributes.site;
        if (content.attributes.page && typeof content.attributes.page == 'string') meta.page = content.attributes.page;
      } else {
        let sauce = raw.split(/~{4,}/);
        let tilde = raw.match(/~{4,}/gi) || [];
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
            } else if (ln.toLowerCase().startsWith("parentpage")) {
              placeholder.splice(placeholder.indexOf(ln), 1)
              info.parentPage = ln.substring("parentpage:".length).split(" ").filter(v=>!!v).join(" ").trim().replace(/~/g,':')
            } else if (ln.toLowerCase().startsWith("parent")) {
              placeholder.splice(placeholder.indexOf(ln), 1)
              info.parentPage = ln.substring("parent:".length).split(" ").filter(v=>!!v).join(" ").trim().replace(/~/g,':')
            } else if (ln.toLowerCase().startsWith("comments")) {
              placeholder.splice(placeholder.indexOf(ln), 1)
              info.comments = ln.substring("comments:".length).split(" ").filter(v=>!!v).join(" ");
            }
          }
          if (placeholder.length) {
            console.log(`[WARN] Multiline comments are not supported anymore as Wikidot does not separate comment lines.\n       Please put all of your comments on one line. (:${s}:${p.replace(/~/g,':').split(".")[0]})`)
          }
          meta = Object.assign(meta, info);
          delete meta.source;
          if (meta.parentPage !== undefined) {
            meta.parent = meta.parentPage;
            delete meta.parentPage;
          }
          fs.writeFileSync(path.join(config.source,s,p), `---\n${yaml.dump(meta)}---\n${info.source}`, 'utf-8');
          lastModified[s][p] = fs.statSync(path.join(config.source,s,p)).mtimeMs;     
        }
      }
      queue.push({s:meta.site, p:meta.page, info, requeue: false});
    }
  }
  
  for (let i = 0; i < queue.length; i++) {    
    let err = null;
    let s = queue[i].s, p = queue[i].p, info = queue[i].info, requeue = queue[i].requeue;
    await wd.edit(s, p, info)
      .catch(e=>{
      err = e;
      switch (e.status) {
        case 500:
          console.log(`Error at editing :${s}:${p} : Response code 500 (Internal Server Error)`);
          break;
          
        case "not_ok":
          // Wikidot now dies when new page is created with tags in its options
          // Put them in queue for seperate processing of page creation and tags
          let tags = info.tags;
          delete info.tags;
          queue.push({s,p,info,requeue:true}, {s,p,info:Object.assign({tags}, info),requeue:true});
          break;
          
        default:
          console.log(`Error at editing :${s}:${p} : ${typeof e.status == "number" ? e.message : JSON.stringify(e.src,null,2)}`);
          break;
      }
    }).finally(()=>{
      if (!err) {
        if (requeue) {
          console.log(`Successfully ${info.tags ? "tagged" : "posted to"} :${s}:${p}`);
        } else console.log(`Successfully posted to :${s}:${p}`);
      }
    })
    
    await (new Promise((resolve)=>{ setTimeout(()=>{ resolve() }, 3000)}));
  }
  fs.writeFileSync(lmpath,
    JSON.stringify(lastModified, null, 2), 'utf-8');
})().catch(e=>{throw e})
