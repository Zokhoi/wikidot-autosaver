const readlineSync = require('readline-sync');
const got = require('got');
class Site {
  constructor(base) {
    this.wiki(base);
  }
  wiki(base) {
    if (!base.startsWith("http")) { base = `http://${base}.wikidot.com` }
    this.base = `${base}/ajax-module-connector.php`;
    return this;
  }
}

module.exports = class WD {
  constructor(bases) {
    this.bases = new Map();
    this.cookie = {
      auth: '',
      sess: '',
      expires: null
    };
    for (let s of bases) {
      this.bases.set(s, new Site(s))
    }
  }
  setCookies(v) { Object.assign(this.cookie, v) }

  async req(base, params={}) {
      const wikidotToken7 = Math.random().toString(36).substring(4);
      let res, e;
      try {
        res = await got.post(base, {
          headers: {
            'User-Agent': 'WDAutosaver/1.1',
            // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            Referer: 'wikidot autosaver',
            Cookie: `wikidot_token7=${wikidotToken7}; ${this.cookie.auth}`,
          },
          form: Object.assign({wikidot_token7: wikidotToken7, callbackIndex: 0}, params)
        }).json();
      } catch (err) {
        e = err;
        e.status = e.response.statusCode;
        throw e;
      }
      if (res.status!='ok') {
        e = new Error(res.message);
        e.status = res.status;
        e.src = res;
      }
      if (e) {
        throw e;
      } else return res;
  };

  async module(base, moduleName, params={}) {
    return await this.req(base, Object.assign({moduleName: moduleName},params))
  };

  async action(base, action, params={}) {
    return await this.req(base, Object.assign({action: action, moduleName: "Empty"},params))
  };

  async askLogin() {
    let un = null, pw = null;
    while (!un) {
      un = readlineSync.question("Please enter your wikidot username: ");
    }
    while (!pw) {
      pw = readlineSync.question("Please enter your wikidot password: ", {hideEchoBack: true});
    }
    return await this.login(un, pw);
  }

  async login(username, password) {
    const wikidotToken7 = Math.random().toString(36).substring(4);
    let res = await got.post('https://www.wikidot.com/default--flow/login__LoginPopupScreen', {
      headers: {
        'User-Agent': 'WDAutosaver/1.1',
        Referer: 'wikidot autosaver',
        Cookie: `wikidot_token7=${wikidotToken7}`
      },
      form: {
				login: username,
				password: password,
				action: 'Login2Action',
				event: 'login',
        wikidot_token7: wikidotToken7,
        callbackIndex: 0
			}
		})
    if (res.body.includes("The login and password do not match.")) {throw new Error("The login and password do not match.")}
    let tmp = res.headers['set-cookie'][1].split("; ")
  	this.cookie.sess = tmp[0]
  	this.cookie.expire = tmp[1].split("=")[1]
    this.cookie.auth = `${this.cookie.sess}; wikidot_udsession=1`
    return this;
  }

  async edit(site, wiki_page, params={}) {
    let base = this.bases.get(site)==undefined ? site : this.bases.get(site).base ;
    var lock = await this.module(base, 'edit/PageEditModule', {
            mode: 'page',
            wiki_page: wiki_page,
            force_lock: true})
    if (lock.status!='ok') {
      let e = new Error(lock.message);
      e.status = lock.status;
      e.response = lock;
      throw e;
    }
    return await this.action(base, 'WikiPageAction', Object.assign({
      event: 'savePage',
      wiki_page: wiki_page,
      lock_id: lock.lock_id,
      lock_secret: lock.lock_secret,
      revision_id: lock.page_revision_id||null,
    }, params))
  }
}
