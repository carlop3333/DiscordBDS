import * as net from "@minecraft/server-net";
import * as admin from "@minecraft/server-admin";
import { world } from "@minecraft/server";

world.afterEvents.worldInitialize.subscribe((data) => {
  console.log("Hold on!");
  /* try {
    const req = new net.HttpRequest(admin.variables.get("server-url"));
    net.http.request(req);
  } catch (e) {
    console.error(e);
  } */
});
