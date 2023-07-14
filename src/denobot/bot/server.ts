//Remove imports when replacing the main one (or maybe not, letting the server here can be a good idea)
import config from "./config.json" assert { type: "json" };
import { debug } from "./main.ts";
import { reqHandler } from "./handler.ts";

//Fallback if the main.ts server doesn't work
const listener = Deno.listen({ port: config.serverPort });
console.log(`Server opened on localhost:${config.serverPort}`);

for await (let conn of listener) {
  bedrockRequestFallback(conn);
}


const requestTypes = ["dmessage", "connect", "ready", "update"]
async function bedrockRequestFallback(conn: Deno.Conn) {
  if (debug)
    console.log(`Client connected from remote address ${conn.remoteAddr}`);
  const serverConn = Deno.serveHttp(conn);
  for await (let req of serverConn) {
    if (req.request.headers.get("Content-Type") == "application/json") {
        if (debug) console.log("Client found to be a bedrock server!")
        const rdata = await req.request.json();
        requestTypes.forEach(async (val) => {
            if (rdata.requestType == val) {
              try {
                await reqHandler.awaitForPayload(val, payload => {
                  req.respondWith(new Response(JSON.stringify(payload),{status: 200}))
                })
              } catch (e) {
                console.error(e)
              }
            } 
        })
    }
  }
}
