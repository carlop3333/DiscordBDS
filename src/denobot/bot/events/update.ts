import {
  requestEventBuilder,
  genericRequest,
} from "../types.ts";


export const command: requestEventBuilder = {
  eventName: "update",
  onExecution(_payload: genericRequest) {
    return new Promise<genericRequest>((res) => {
      addEventListener("dsignal", (listener) => {
        if (listener instanceof CustomEvent) {
          const detail = listener.detail as genericRequest;
          res(detail);
        }
      });
    });
  },
};

