import { EventEmitter } from "node:events";

//interface declare
export interface genericRequest {
  requestType: string;
}
export interface connectRequest extends genericRequest {
  data: { authorName: string; join: boolean };
}
export interface messageRequest extends genericRequest {
  data: { authorName: string; message: string; rank: string };
}
export interface deathRequest extends genericRequest {
  data: { authorName: string; reason: string };
}

//add here for linting and for the compiler not dying
//I know this is useless, but for the sake of the autocompletions...
declare interface bedrockHandler {
  // Things used for promises need "once"!!!
  on(event: "ready", listener: (genericRequest: genericRequest) => void): this;
  on(event: "connect", listener: (connectRequest: connectRequest) => void): this;
  on(event: "dmessage", listener: (messageRequest: messageRequest) => void): this;
  on(event: "mcmessage", listener: (messageRequest: messageRequest) => void): this;
  on(event: "update", listener: (genericRequest: genericRequest) => void): this;
  on(event: "death", listener: (genericRequest: deathRequest) => void): this;
  on(event: string, listener: unknown): this;

  once(event: "dmessage", listener: (messageRequest: messageRequest) => void): this;
  once(event: string, listener: unknown): this;


  awaitForPayload(eventName: string, payloadToRecieve: (payload: Object) => void): void;
  awaitForPayload(eventName: "dmessage", payloadToRecieve?: (payload: messageRequest) => void): void;
  awaitForPayload(eventName: "death", payloadToRecieve?: (payload: deathRequest) => void): void;
}

class bedrockHandler extends EventEmitter {
  public sendPayload(payload: string, dataToSend: Object) {
    this.emit(`${payload}x`, dataToSend)
  }
  public awaitForPayload(
    eventName: string,
    payloadToRecieve: (payload: Object) => void
  ) {
    this.once(`${eventName}x`, (payload: object) => {
      payloadToRecieve(payload)
    })
  }
  
  /**
   * Sends a custom signal to minecraft
   * @param signalName The custom signal of the name (TODO: Set signals on the wiki)
   * @param content The custom content to send, useful for other addons
   */
  public sendCustDiscordSignal(
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
