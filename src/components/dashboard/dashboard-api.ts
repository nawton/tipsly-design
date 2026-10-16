/**
 * Business dashboard network calls.
 *
 * Demo: there is no backend yet, so these only wait as long as the real
 * request is expected to take. Replace their bodies with the real API calls.
 */

import type { ProfileForm } from "./dashboard-context";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Saves the public business profile. */
export async function saveBusinessProfile(form: ProfileForm): Promise<void> {
  void form; // Real API call goes here.
  await wait(900);
}
