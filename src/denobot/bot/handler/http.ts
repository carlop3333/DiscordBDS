/*
 * http handler
 * bit simple, requires an addon
 * uses long-polling :)
 */

import {
  genericRequest,
  requestEventBuilder,
} from "../handler.ts";
import { debug } from "../main.ts";
import { clog } from "../utils.ts";
import * as colors from "std/fmt/colors.ts";

const requestTypes = [
  "connect",
  "ready",
  "update",
  "mcmessage",
  "death",
  "void",
];

// Bedrock server (Shit to declare before this comment)

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
            try {
              if (!debug) clog.debug(`${jdata.requestType} => client`); //* DEBUG
              //never use dynamic import with (fs), it will cause a rce...
              const event = await import(`./events/${jdata.requestType}.ts`);
              if ("command" in event) {
                const command: requestEventBuilder = event.command;
                if (!debug) clog.debug(`executed ${command.eventName} <=`); //* DEBUG
                return command.onExecution(jdata);
              } else {
                return new Response(`Internal Server Error`, {
                  status: 500,
                  statusText: "Internal Server Error",
                });
              }
            } catch {
              return new Response(`Internal Server Error`, {
                status: 500,
                statusText: "Internal Server Error",
              });
            }
          } else {
            return new Response("Internal Server Error", {
              status: 500,
              statusText: "Internal Server Error",
            });
          }
        } catch (_e) {
          return new Response(undefined, {
            status: 500,
            statusText: "Internal Server Error",
          });
        }
      } else {
        return new Response(undefined, {
          status: 403,
          statusText: "Access Denied",
        });
      }
    } else {
      return new Response(undefined, {
        status: 403,
        statusText: "Access Denied",
      });
    }
  });
}
