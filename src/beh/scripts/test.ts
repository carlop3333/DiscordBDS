import { system, TicksPerSecond } from "@minecraft/server";
import * as net from "@minecraft/server-net";

const SERVER_URL = "http://localhost:5056";

function sleep(sec = 2) {
  return new Promise<void>((res) => system.runTimeout(() => res(), sec * TicksPerSecond));
}
// all test requests here
const requests = [
  { requestType: "ready" },
  { requestType: "update" },
  { requestType: "anon" }, //Should be Internal Server Error
  { requestType: "connect", data: { authorName: "Matiaswazaaaaaa", join: true } },
  { requestType: "connect", data: { authorName: "Matiaswazaaaaaa", join: false } },
  { requestType: "connect", data: { authorName: "Matiaswazaaaaaa", join: true } },
  { requestType: "death", data: { authorName: "Matiaswazaaaaaaa", reason: "died by test 3" } },
  { requestType: "death", data: { authorName: "Matiaswazaaaaaaa", reason: "died by test 4" } },
  { requestType: "death", data: { authorName: "Matiaswazaaaaaaa", reason: "died by test 5" } },
];
const shit: Array<net.HttpResponse> = [];
const req = new net.HttpRequest(SERVER_URL)
  .addHeader("Content-Type", "application/json")
  .setMethod(net.HttpRequestMethod.Post);
export async function test() {
  async function sendRequest(request: net.HttpRequest, externalArray: Array<net.HttpResponse>) {
    externalArray.push(await net.http.request(request));
  }
  for (let i = 0; i <= requests.length - 1; i++) {
    console.log(i);
    req.setBody(JSON.stringify(requests[i]));
    console.log("Starting test ", i);
    sendRequest(req, shit);
    await sleep(2);
  }
  shit.forEach((req) => {
    console.log(`${req.body}`);
    console.log(`${req.status}`);
  });
}
