// deno-lint-ignore-file no-case-declarations
/*
 * protocol handler
 * uses an xbox live id to connect to the server
 */

import { ClientOptions } from "bedrock-protocol";
import { config } from "../main.ts";
import { clog } from "../utils.ts";
import * as path from "std/path/mod.ts";
import { bold } from "std/fmt/colors.ts";

function tryStartNode(loc: string, options: string) {
  const td = new TextDecoder();
  async function startCode() {
    const child = new Deno.Command(path.toFileUrl(loc), {
      args: ["start", options],
      cwd: path.fromFileUrl(import.meta.resolve("./nodeProtocol/")),
      stdout: 'piped'
    }).spawn();
    clog.start('Starting connection with Node...')
    for await (const outArray of child.stdout) {
      clog.info(td.decode(outArray, {stream: true}));
    }
    clog.fatal('Stream closed. Shutting down bot..');
    Deno.exit(0);
  }

  try {
    clog.info(
      "Starting node... If this is your first time, it will take a ton to install the npm packages..."
    );
    //this will install all the shit if its not here
    const npmoutput = new Deno.Command(path.toFileUrl(loc), {
      args: ["i", "--save"],
      cwd: path.fromFileUrl(import.meta.resolve("./nodeProtocol/")),
    }).outputSync();
    if (npmoutput.success) {
      // \nadded or \nup
      //newbie shit anyways
      const out = td.decode(npmoutput.stdout).replace("\n", "").split(" ", 1)
      clog.debug(out)
      if (out[0] === "added") {
        clog.info("Packages installed!");
        startCode();
      } else if (out[0] == "up") {
        clog.info("Packages were already installed! Continuing...");
        startCode();
      } else  {
        console.log("shit");
      }
    } else {
      throw new Error(bold("npm failed to install packages"));
    }
  } catch (_e) {
    clog.error("Couldn't Install/Download npm packages, seems that node is not installed D:");
    new Deno.Command("bash", {
      args: [
        "-c",
        "'curl",
        "-fsSL https://fnm.vercel.app/install",
        "|",
        "bash'",
      ],
    }).spawn();
  }
}

export function startProtocolServer() {
  let id = config.advanced.serverID;
  //default if server
  let options: ClientOptions = {
    host: id,
    username: "DiscordBDSBot",
    port: 19132,
    conLog: clog.info,
    offline: false,
    profilesFolder: "auth_tokens"
  };
  if (
    config.advanced.serverID.startsWith("http") ||
    config.advanced.serverID.startsWith("realms")
  ) {
    clog.debug("Realm link found");
    //ts avoiding errors again
    id = (config.advanced.serverID as string).match(/(.*)\/(.*)/)![2];
    options = {
      realms: {
        realmInvite: id,
      },
      username: "DiscordBDSBot",
      host: "",
      port: 0,
      offline: false,
      profilesFolder: "auth_tokens"
    };
  }

  //we ball bedrock_prot is not supported on deno, thanks crypto lib
  //this is temporal btw
  const npmLocation = () => {
    const td = new TextDecoder();
    switch (Deno.build.os) {
      case "linux":
      case "darwin":
        return td.decode(
          new Deno.Command(`which`, { args: ["npm"] }).outputSync().stdout
        );
      case "windows":
        return td.decode(
          new Deno.Command(`powershell.exe`, {
            args: [
              "-Command",
              '$(If ($location = Get-Command npm -errorAction SilentlyContinue | Select-Object -ExpandProperty Source) {$location} Else {"npm_not_installed"})',
            ],
          }).outputSync().stdout
        );
    }
  };
  //* The // to / is a WSL fix
  const loc = npmLocation()?.trim().replace("//", "/");
  clog.debug(`${loc} <= path`);
  //console.log(path.toFileUrl(loc!))
  if (loc !== undefined && loc !== "npm_not_installed" && loc !== null) {
    tryStartNode(loc, JSON.stringify(options))
  }
}
