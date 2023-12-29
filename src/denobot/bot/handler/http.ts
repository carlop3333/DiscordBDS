/*
 * http handler
 * bit simple, requires an addon
 * uses long-polling :)
 */

import {
  genericRequest,
} from "../types.ts";
import { clog } from "../utils.ts";
import * as colors from "std/fmt/colors.ts";

const requestTypes = [
  "connect",
  "ready",
  "update",
  "message",
  "death",
  "void",
];


//local EventTarget
const emitter = new EventTarget();

//* a ip getter, can't be used yet
/* function getRemoteIP(ip: Deno.ServeHandlerInfo): Deno.NetAddr {
  function checkAddr(add: Deno.Addr): asserts add is Deno.NetAddr {
    if (!add.transport.includes("tcp") && !add.transport.includes("udp")) {
      throw new Error("Unix net");
    }
  }
  checkAddr(ip.remoteAddr);
  return ip.remoteAddr;
} */

//error and deny responses
function deniedResponse(): Response {
  return new Response(undefined, {status: 403, statusText: "Access Denied"})
}

function errorResponse(e: unknown): Response {
  return new Response(`${e}`, {status: 500, statusText: "Internal Server Error"})
}

//function to pass args to other 
async function httpEmitter(ev: Event) {
  const event = ev as CustomEvent;
  const msgdata = event.detail;
  const remoteFunc = await import (`../events/connect.ts`);
  if ("command" in remoteFunc) {
    clog.debug(`${remoteFunc.command.eventName} <= client requested`)
    const result = await remoteFunc.command.onExecution(msgdata);
    emitter.dispatchEvent(new CustomEvent(`${event.type}x`, {"detail": result}));
  } else {
    throw new SyntaxError("there is a wrong file in /events (doesn't have the command builder)")
  }
}

//listener declarations
for (const reqType of requestTypes) {
  emitter.addEventListener(reqType, listener => httpEmitter(listener))
}

export function startHTTPServer(serverPort: number) {
  clog.info(`Server started in localhost: ${colors.blue(serverPort.toString())}`);
  Deno.serve({ port: serverPort }, async (req, _info) => {
    if (
      req.headers.get("Content-Type") == "application/json" &&
      req.method == "POST"
    ) {
      const rawdata = await req.text();
      if (rawdata !== "") {
        try {
          const jdata: genericRequest = JSON.parse(rawdata);
          if (requestTypes.includes(jdata.requestType)) {
            return new Promise<Response>(res => {
              emitter.addEventListener(`${jdata.requestType}x`, listener => {
                res(new Response((listener as CustomEvent).detail, {status: 200}));
              }, {"once": true})
              emitter.dispatchEvent(new CustomEvent(jdata.requestType, {"detail": jdata, cancelable: false}))
            })            
          } else {
            return errorResponse("No requestTypes included in JSON");
          }
        } catch (e) {
          return errorResponse(e);
        }
      } else {
        return deniedResponse();
      }
    } else {
      return deniedResponse();
    }
  });
}
