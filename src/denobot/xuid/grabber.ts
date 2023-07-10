import * as cheerio from "cheerio";
import { Buffer } from "node:buffer";


class XUIDGrabber {
  async #getTokens() {
    const webScrap = await fetch("https://www.cxkes.me/xbox/xuid");
    const $ = cheerio.load(await webScrap.text());
    const wToken = $('input[type="hidden"]').val();
    const cookies = webScrap.headers.get("set-cookie")?.split(" ");
    return await JSON.stringify({
      cookie: `${cookies?.[0]} ${cookies?.[10].slice(
        0,
        cookies?.[10].length - 1
      )}`,
      token: wToken,
    });
  }
  async getUserData(gamertag: string) {
    const tokens = await JSON.parse(await this.#getTokens());
    const data = `_token=${tokens.token}&gamertag=${gamertag}`;
    const header = {
      Host: "www.cxkes.me",
      "Accept-Encoding": "gzip, deflate,br",
      "Content-Length": Buffer.byteLength(data).toString(),
      Origin: "https://www.cxkes.me",
      DNT: "1",
      Connection: "keep-alive",
      Referer: "https://www.cxkes.me/xbox/xuid",
      Cookie: tokens.cookie,
      "Upgrade-Insecure-Requests": "1",
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
    const a = await fetch("https://www.cxkes.me/xbox/xuid", {
    method: "POST",
    body: data,
    headers: header,
    });
    if (!a.ok) {
        console.error(`Oops! ${a.status} ${a.statusText}`)
    } else {
        const $ = cheerio.load(await a.text())
        const raw = $("div[class=col-md-12]").text();
        const texToRep = [/\n/g, "(DEC):", "(HEX):", "Gamer Score:", "Account Tier:", "Following:", "Followers:", /XUID/g, /\s+/g]
        let test = raw.replace("Name: (not shared)","not-shared").replace("Name: ","");
        for (const x of texToRep) {
          test = test.replace(x," ");
        }
        const data = test.substring(0, test.length - 27).trim().split(" ");
        const dataMap = new Map();
        data.forEach((val, ind) => {
            const others = ["name", "xuid-dec","xuid-hex","real-name","gamerscore","account-tier","followers","following"]
            dataMap.set(others[ind], val)
        })
        return dataMap;
    }
  }
}

export const xuidGrabber = new XUIDGrabber()

