const readlineSync = require('readline-sync');
const got = require('got');
class Site {
  constructor(base) {
    this.wiki(base);
  }
  wiki(base) {
    this.base = `${base}/ajax-module-connector.php`;
    return this;
  }

  async req(cookies, params) {
      const wikidotToken7 = Math.random().toString(36).substring(4);
      return await got.post(this.base, {
        headers: {Cookie: `${cookies.auth}wikidot_token7=${wikidotToken7}`},
        form: Object.assign({wikidot_token7: wikidotToken7, callbackIndex: 0}, params)
      }).json();
  };

  async edit(cookies, wiki_page, params) {
    let lock = await this.req({
            moduleName: 'edit/PageEditModule',
            mode: 'page',
            wiki_page: wiki_page,
            force_lock: true})
    return await this.req(cookies, Object.assign({
      action: "WikiPageAction",
      event: "savePage",
      moduleName: "Empty",
      wiki_page: wiki_page,
      lock_id: lock.lock_id,
      lock_secret: lock.lock_secret,
      revision_id: lock.page_revision_id||null,
      title: "",
      source: "",
      comment: ""
    },params))
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
      headers: {Cookie: `wikidot_token7=${wikidotToken7}`},
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
    this.cookie.auth = `${this.cookie.sess}; wikidot_udsession=1; `
    return this;
  }

  async req(site, params) {
    return await this.bases.get(site).req(this.cookie, params);
  }

  async edit(site, wiki_page, params) {
    return await this.bases.get(site).edit(this.cookie, wiki_page, params);
  }
}
