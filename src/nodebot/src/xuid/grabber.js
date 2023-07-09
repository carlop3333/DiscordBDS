const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require("fs");
const cheerio = require("cheerio")


var config;

async function goToToken() {
  const webscrap = await fetch("https://www.cxkes.me/xbox/xuid");
  const html = await webscrap.text();

  const c = cheerio.load(html);
  var wToken = c('input[type="hidden"]').val();
  var cookies = webscrap.headers.get("set-cookie").split(" ");

  await fs.writeFileSync(
    "./token.json",
    JSON.stringify({
      cookie: `${cookies[0]} ${cookies[10].slice(0, cookies[10].length - 1)}`,
      token: wToken,
    })
  );
  console.log("Updated cookies and token! Nice... Reload!");
  doRequest()
}

const gamertag = process.argv.slice(2);

async function doRequest() {
  try {
    config = JSON.parse(fs.readFileSync("./token.json").toString("utf8"));
  } catch (e) {
    config = JSON.stringify({cookie: "", token: ""})
  }
  const data = `_token=${config.token}&gamertag=${gamertag[0]}`;
  const header = {
    Host: "www.cxkes.me",
    "Accept-Encoding": "gzip, deflate,br",
    "Content-Length": Buffer.byteLength(data),
    Origin: "https://www.cxkes.me",
    DNT: 1,
    Connection: "keep-alive",
    Referer: "https://www.cxkes.me/xbox/xuid",
    Cookie: config.cookie,
    "Upgrade-Insecure-Requests": 1,
    "Sec-Fectch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "User-Agent":
    // average user, right?
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3",
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const response = await fetch("https://www.cxkes.me/xbox/xuid", {
    method: "POST",
    body: data,
    headers: header,
    compress: true,
  });
  if (!response.ok) {
    console.error(`First time or what? Getting tokens...`);
    goToToken();
    return undefined
  } else {
    const readAgain = await response.text();
    const $ = cheerio.load(readAgain);
    //It also deletes (DEC), (HEX) and XUID, and other useless shit.
    var raw = $("div[class=col-md-12]")
      .text()
      // TODO: Array replacing doesn't work for now, need a solution later
      .replace(/\n/g, " ")
      .replace("(DEC):", " ")
      .replace("(HEX):", " ")
      .replace("Name: (not shared)", "not-shared")
      .replace("Gamer Score:", " ")
      .replace("Account Tier:", " ")
      .replace("Following:", " ")
      .replace("Followers:", " ")
      .replace(/XUID/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    var dataSend = raw.substring(0, raw.length - 27).split(" ");
    var dataMap = new Map();
    dataSend.forEach((val, ind) => {
      // Ordering everything in a map :)
      switch (ind) {
        case 0:
          dataMap.set("name", val);
          break;
        case 1:
          dataMap.set("xuid-dec", val);
          break;
        case 2:
          dataMap.set("xuid-hex", val);
          break;
        case 3:
          dataMap.set("real-name", val);
          break;
        case 4:
          dataMap.set("gamerscore", val);
          break;
        case 5:
          dataMap.set("account-tier", val);
          break;
        case 6:
          dataMap.set("followers", val);
          break;
        case 7:
          dataMap.set("following", val);
          break;
      }
    });
    return dataMap;
  }
}


// thanks for not being a module
if (gamertag[0] !== undefined || gamertag[1] !== undefined) {
  isConsole()
}
async function isConsole() {
  if (gamertag[1] == "--detailed") {
    const data = await doRequest();
    if (data !== undefined) {
      data.forEach((val, key) => {
        console.log(`${key}: ${val}`);
      });
    } 
  } else if (gamertag[0] !== undefined) {
    const data = await doRequest();
    if (data !== undefined) {
      console.log(`XUID: ${data.get("xuid-dec")}`);
    }
  }
}


class XUIDGrabber {
  async getXUID(gamerTag) {
    gamertag[0] = gamerTag
    return await doRequest()
  }
}

const xuidGrabber = new XUIDGrabber()
module.exports = xuidGrabber;