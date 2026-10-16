export type NewBusinessProfile = {
  name: string;
  /** Category id, e.g. "skonhet". */
  cat: string;
  /** City id, e.g. "malmo". */
  city: string;
  email: string;
};

/**
 * Creates a free business profile.
 *
 * Demo: nothing is stored, it only waits as long as a real request would take.
 * This is where the real API call goes (a POST to the backend or a server
 * action); throw on failure so the form can recover.
 */
export async function createBusinessProfile(profile: NewBusinessProfile): Promise<void> {
  void profile;
  await new Promise((resolve) => setTimeout(resolve, 1200));
}
