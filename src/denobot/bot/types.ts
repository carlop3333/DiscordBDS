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
export interface requestEventBuilder {
  eventName: string, onExecution(payload: genericRequest): Promise<genericRequest> | genericRequest
}




