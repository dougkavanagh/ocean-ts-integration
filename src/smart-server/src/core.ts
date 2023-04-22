export class ErrorMessage {
  message: string;
  httpCode?: number;
  code?: string;
  error?: Error;
  constructor(e: any) {
    if (e.message) {
      this.message = e.message.toString();
    } else {
      this.message = e.toString();
    }
    if (e.code) {
      this.code = e.code.toString();
    }
    if (e.error) {
      this.error = e.error as Error;
    }
    this.httpCode = e.httpCode;
  }
}
export function isErrorMessage(obj: any): obj is ErrorMessage {
  return obj && obj.message;
}
