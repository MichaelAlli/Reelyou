/** In-memory trace of the latest password-forgot email attempt (no secrets). */
export type PasswordForgotEmailTrace = {
  routeHandlerInvokedAt: string | null;
  handlerStartAt: string | null;
  userFound: boolean | null;
  emailFunctionStartAt: string | null;
  sendTransactionalEmailStartAt: string | null;
  beforeResendRequestAt: string | null;
  selectedProvider: string | null;
  resendHttpStatus: number | null;
  resendErrorType: string | null;
  resendErrorMessage: string | null;
  resendResponseSummary: string | null;
  sendResult: string | null;
  exceptionName: string | null;
  exceptionMessage: string | null;
};

const emptyTrace = (): PasswordForgotEmailTrace => ({
  routeHandlerInvokedAt: null,
  handlerStartAt: null,
  userFound: null,
  emailFunctionStartAt: null,
  sendTransactionalEmailStartAt: null,
  beforeResendRequestAt: null,
  selectedProvider: null,
  resendHttpStatus: null,
  resendErrorType: null,
  resendErrorMessage: null,
  resendResponseSummary: null,
  sendResult: null,
  exceptionName: null,
  exceptionMessage: null,
});

let trace: PasswordForgotEmailTrace = emptyTrace();

export function resetPasswordForgotEmailTraceForTests(): void {
  trace = emptyTrace();
}

export function getPasswordForgotEmailTrace(): Readonly<PasswordForgotEmailTrace> {
  return trace;
}

export function markPasswordForgotRouteHandlerInvoked(): void {
  trace = { ...emptyTrace(), routeHandlerInvokedAt: new Date().toISOString() };
}

export function markPasswordForgotHandlerStart(): void {
  trace.handlerStartAt = new Date().toISOString();
}

export function markPasswordForgotUserFound(found: boolean): void {
  trace.userFound = found;
}

export function markPasswordForgotEmailFunctionStart(): void {
  trace.emailFunctionStartAt = new Date().toISOString();
}

export function markSendTransactionalEmailStart(provider: string): void {
  trace.sendTransactionalEmailStartAt = new Date().toISOString();
  trace.selectedProvider = provider;
}

export function markBeforeResendRequest(): void {
  trace.beforeResendRequestAt = new Date().toISOString();
}

export function markResendHttpResponse(input: {
  status: number;
  errorType?: string;
  errorMessage?: string;
  bodySummary?: string;
}): void {
  trace.resendHttpStatus = input.status;
  trace.resendErrorType = input.errorType ?? null;
  trace.resendErrorMessage = input.errorMessage?.slice(0, 300) ?? null;
  trace.resendResponseSummary = input.bodySummary?.slice(0, 300) ?? null;
}

export function markPasswordForgotSendResult(result: string): void {
  trace.sendResult = result;
}

export function markPasswordForgotException(name: string, message: string): void {
  trace.exceptionName = name;
  trace.exceptionMessage = message.slice(0, 300);
}
