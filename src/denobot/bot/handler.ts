import { EventEmitter } from "node:events";

//interface declare
interface genericRequest {
  requestType: string;
}
export interface connectRequest extends genericRequest {
  data: { authorName: string; join: boolean };
}
export interface messageRequest extends genericRequest {
  data: { authorName: string; message: string; rank: string };
}

//add here for linting and for the compiler not dying
declare interface bedrockHandler {
  // Things used for promises need "once"!!!
  on(event: "ready", listener: (genericRequest: genericRequest) => void): this;
  on(event: "connect", listener: (connectRequest: connectRequest) => void): this;
  on(event: "dmessage", listener: (messageRequest: messageRequest) => void): this;
  once(event: "dmessage", listener: (messageRequest: messageRequest) => void): this;
  on(event: "update", listener: (genericRequest: genericRequest) => void): this;
  on(event: string, listener: Function): this;

  awaitForPayload(eventName: string, payloadToRecieve: (payload: Object) => void): void;
  awaitForPayload(eventName: "dmessage", payloadToRecieve?: (payload: messageRequest) => void): void;
}

class bedrockHandler extends EventEmitter {
  async awaitForPayload(
    eventName: string,
    payloadToRecieve: (payload: Object) => void
  ) {
    let obj = {};
    const a = await this.emit(eventName, obj);
    if (a) {
        payloadToRecieve(obj)
    }
  }
  /**
   * Sends a custom signal to minecraft
   * @param signalName The custom signal of the name (TODO: Set signals on the wiki)
   * @param content The custom content to send, useful for other addons
   */
  sendCustDiscordSignal(
    signalName: string,
    content: {
      requestType: "custom";
      contents: Record<string | number, symbol | null>;
    }
  ) {
    // TODO: Edit me
    this.emit(signalName, content);
  }
}

export const reqHandler = new bedrockHandler();
