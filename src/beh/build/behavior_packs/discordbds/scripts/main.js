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

//# sourceMappingURL=../../_discordbdsDebug/main.js.map
