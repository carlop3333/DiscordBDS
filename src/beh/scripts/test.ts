import { system, TicksPerSecond } from "@minecraft/server";
import * as net from "@minecraft/server-net";
import { SERVER_URL } from "./main";

function sleep(sec = 2) {
  return new Promise<void>((res) => system.runTimeout(() => res(), sec * TicksPerSecond));
}
// all test requests here
const requests = [
  { requestType: "update" },
  { requestType: "connect", data: { authorName: "Matiaswazaaaaaa", join: true } },
  { requestType: "connect", data: { authorName: "Matiaswazaaaaaa", join: false } },
  { requestType: "connect", data: { authorName: "Matiaswazaaaaaa", join: true } },
  { requestType: "death", data: { authorName: "Matiaswazaaaaaaa", reason: "died by test 3" } },
  { requestType: "death", data: { authorName: "Matiaswazaaaaaaa", reason: "died by test 4" } },
  { requestType: "death", data: { authorName: "Matiaswazaaaaaaa", reason: "died by test 5" } },
];
const req = new net.HttpRequest(SERVER_URL).addHeader("Content-Type", "application/json");
export function test() {
  for (let i = 0; i <= requests.length; i++) {
    req.setBody(JSON.stringify(requests[i]));
    console.log("Starting test " + i);
    net.http.request(req).then((res) => {
      if (res.body as string) {
        console.log("Ignoring request as intended");
      }
    });
  }
}
