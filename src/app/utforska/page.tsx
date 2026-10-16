import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_CITY, isCity } from "@/lib/data";
import { CITY_COOKIE, routes } from "@/lib/routes";

/** /utforska without a city goes to the visitor's city. */
export default async function DiscoverIndex() {
  const city = (await cookies()).get(CITY_COOKIE)?.value;
  redirect(routes.discover({ city: isCity(city) ? city : DEFAULT_CITY }));
}
