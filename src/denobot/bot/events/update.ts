import {
  requestEventBuilder,
  genericRequest,
} from "../handler.ts";


export const command: requestEventBuilder = {
  eventName: "update",
  onExecution(_payload: genericRequest) {
    return new Promise<Response>((res) => {
      addEventListener("dsignal", (listener) => {
        if (listener instanceof CustomEvent) {
          const detail = listener.detail as CustomEvent<genericRequest>;
          res(new Response(JSON.stringify(detail), { status: 200 }));
        }
      });
    });
  },
};

