// Do something here
/* 
function sleep(sec = 2) {
  return new Promise<void>((res) => system.runTimeout(() => res(), sec * TicksPerSecond));
}
this.#req.setBody(JSON.stringify({ requestType: "ready" }));
    try {
      console.log("Test starting!");
      net.http.request(this.#req).then(async (res) => {
        if (res.status === 2147954429) {
          console.error(`Request didn't send correctly, trying again in ${sec} seconds`);
          //sec max check
          if (sec <= 32) sec += sec;
          system.runTimeout(() => {
            this.start();
          }, sec * TicksPerSecond);
        } else {
          const jdata = JSON.parse(res.body);
          if (jdata.requestType == "update") {
            console.log("Connected with server!");
            console.log("test 1");
            net.http.request(
              new net.HttpRequest("http://localhost:5056")
                .addHeader("Content-Type", "application/json")
                .setBody(
                  JSON.stringify({ requestType: "connect", data: { authorName: "Matiaswazaaaaaa", join: false } })
                )
            );
            await sleep(4);
            console.log("test 2");
            net.http.request(
              new net.HttpRequest("http://localhost:5056")
                .addHeader("Content-Type", "application/json")
                .setBody(
                  JSON.stringify({ requestType: "connect", data: { authorName: "Matiaswazaaaaaa", join: true } })
                )
            );
            await sleep(4);
            console.log("test 3");
            net.http.request(
              new net.HttpRequest("http://localhost:5056").addHeader("Content-Type", "application/json").setBody(
                JSON.stringify({
                  requestType: "death",
                  data: { authorName: "Matiaswazaaaaaaa", reason: "died by test 3" },
                })
              )
            );
            await sleep(4);
            console.log("test 4");
            net.http.request(
              new net.HttpRequest("http://localhost:5056").addHeader("Content-Type", "application/json").setBody(
                JSON.stringify({
                  requestType: "death",
                  data: { authorName: "Matiaswazaaaaaaa", reason: "died by test 4" },
                })
              )
            );
            await sleep(4);
            console.log("test 5");
            net.http.request(
              new net.HttpRequest("http://localhost:5056").addHeader("Content-Type", "application/json").setBody(
                JSON.stringify({
                  requestType: "death",
                  data: { authorName: "Matiaswazaaaaaaa", reason: "died by test 5" },
                })
              )
            );
          } else {
            console.error("You are sure this is the correct host? Server sended other thing...");
          }
        }
      });
    } catch (e) {
      console.error(e);
    } */
