/** In-memory trace of the latest password-forgot email attempt (no secrets). */
export type PasswordForgotEmailTrace = {
  realForgotHandlerEnteredAt: string | null;
  realForgotHandlerBuild: string | null;
  deliveryFailedPathAt: string | null;
  deliveryFailedReason: string | null;
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
  realForgotHandlerEnteredAt: null,
  realForgotHandlerBuild: null,
  deliveryFailedPathAt: null,
  deliveryFailedReason: null,
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

function syncTrace(): void {
  void import('./emailDiagnosticPersistence.js').then((m) => m.persistForgotTraceToPostgres(trace));
}

export function resetPasswordForgotEmailTraceForTests(): void {
  trace = emptyTrace();
}

export function getPasswordForgotEmailTrace(): Readonly<PasswordForgotEmailTrace> {
  return trace;
}

export function markRealForgotHandlerEntered(buildId: string): void {
  trace = {
    ...emptyTrace(),
    realForgotHandlerEnteredAt: new Date().toISOString(),
    realForgotHandlerBuild: buildId,
  };
  syncTrace();
}

export function markRealForgotDeliveryFailedPath(reason: string): void {
  trace.deliveryFailedPathAt = new Date().toISOString();
  trace.deliveryFailedReason = reason.slice(0, 120);
  syncTrace();
}

export function markPasswordForgotRouteHandlerInvoked(): void {
  trace.routeHandlerInvokedAt = new Date().toISOString();
  syncTrace();
}

export function markPasswordForgotHandlerStart(): void {
  trace.handlerStartAt = new Date().toISOString();
  syncTrace();
}

export function markPasswordForgotUserFound(found: boolean): void {
  trace.userFound = found;
  syncTrace();
}

export function markPasswordForgotEmailFunctionStart(): void {
  trace.emailFunctionStartAt = new Date().toISOString();
  syncTrace();
}

export function markSendTransactionalEmailStart(provider: string): void {
  trace.sendTransactionalEmailStartAt = new Date().toISOString();
  trace.selectedProvider = provider;
  syncTrace();
}

export function markBeforeResendRequest(): void {
  trace.beforeResendRequestAt = new Date().toISOString();
  syncTrace();
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
  syncTrace();
}

export function markPasswordForgotSendResult(result: string): void {
  trace.sendResult = result;
  syncTrace();
}

export function markPasswordForgotException(name: string, message: string): void {
  trace.exceptionName = name;
  trace.exceptionMessage = message.slice(0, 300);
  syncTrace();
}
