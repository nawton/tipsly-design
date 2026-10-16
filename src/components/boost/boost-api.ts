/**
 * Tipsly Boost network calls.
 *
 * Demo: there is no backend yet, so these only wait as long as the real
 * request is expected to take. Replace their bodies with the real API calls.
 */

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Places a binding bid (in kronor, excl. VAT) on next week's top placement. */
export async function placeBid(amount: number): Promise<void> {
  void amount; // Real API call goes here.
  await wait(1100);
}
