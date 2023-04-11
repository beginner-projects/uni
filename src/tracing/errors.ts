import { ClientOptions, ErrorEvent, EventHint } from '@sentry/types'

/** Identifies ethers request errors (as thrown by {@type import(@ethersproject/web).fetchJson}). */
function isEthersRequestError(error: Error): error is Error & { requestBody: string } {
  return 'requestBody' in error && typeof (error as unknown as Record<'requestBody', unknown>).requestBody === 'string'
}
/**

 * Filters known (ignorable) errors out before sending them to Sentry.
 * Intended as a {@link ClientOptions.beforeSend} callback. Returning null filters the error from Sentry.
 */
export const filterKnownErrors: Required<ClientOptions>['beforeSend'] = (event: ErrorEvent, hint: EventHint) => {
  const error = hint.originalException
  if (error instanceof Error) {
    if (isEthersRequestError(error)) {
      const method = JSON.parse(error.requestBody).method
      // ethers aggressively polls for block number, and it sometimes fails (whether spuriously or through rate-limiting).
      // If block number polling, it should not be considered an exception.
      if (method === 'eth_blockNumber') return null
    }

    // For now, these errors are not actionable so we should not report them.
    // ethers exceptions are currently not caught in the codebase because we don't try/catch all provider calls.
    if (error.message.match(/call revert exception/)) return null

    // If the error is a network change, it should not be considered an exception.
    if (error.message.match(/underlying network changed/)) return null
  }

  return event
}
