/**
 * Tipsly demo data. All businesses, ratings, reviews, statistics and bids are
 * fictional and generated deterministically from seeds, so the server and the
 * browser always agree on the same catalogue.
 *
 * The exported functions are the data API the UI depends on. When a real
 * backend exists, replace their bodies with API or database calls.
 */

import type {
  Bid,
  Business,
  Category,
  City,
  DayHours,
  HoursRow,
  Market,
  OpenStatus,
  OwnerStats,
  Periods,
  QueryOptions,
  QueryResult,
  RatingBar,
  Review,
  Service,
  SortId,
  SortOption,
  Subcategory,
  SuggestGroup,
  WeekHours,
} from "./types";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function rng(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rand = ReturnType<typeof rng>;

const pick = <T,>(arr: readonly T[], r: Rand): T => arr[Math.floor(r() * arr.length)];
const shuffle = <T,>(arr: T[], r: Rand): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const norm = (s: string | null | undefined) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Swedish number formatting: 3 412 (with a non-breaking space). */
export const nf = (n: number) => Math.round(n).toLocaleString("sv-SE");
/** Swedish currency formatting: 1 250 kr. */
export const kr = (n: number) => nf(n) + " kr";

const MONTHS = ["jan", "feb", "mars", "apr", "maj", "juni", "juli", "aug", "sep", "okt", "nov", "dec"];
const DAYS = ["sön", "mån", "tis", "ons", "tors", "fre", "lör"];
export const DAYS_LONG = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];
/** Day indexes in Swedish week order, Monday first (0 = Sunday). */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const fmtDay = (d: Date) => d.getDate() + " " + MONTHS[d.getMonth()];
const fmtRange = (a: Date, b: Date) =>
  a.getMonth() === b.getMonth()
    ? a.getDate() + "–" + b.getDate() + " " + MONTHS[b.getMonth()]
    : fmtDay(a) + "–" + fmtDay(b);
/** Minutes after midnight to "HH:MM". */
export const hm = (m: number) =>
  String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");

const T = (s: string | null): DayHours => {
  if (!s) return null;
  const [a, b] = s.split("-").map((x) => {
    const q = x.split(":");
    return +q[0] * 60 + +(q[1] || 0);
  });
  return [a, b];
};
/** Week hours indexed by Date#getDay(): weekdays share one span. */
const H = (wk: string, sat: string | null, sun: string | null): WeekHours => {
  const w = T(wk);
  return [T(sun), w, w, w, w, w, T(sat)];
};

export const initials = (name: string) => {
  const w = name.replace(/&/g, " ").split(/\s+/).filter(Boolean);
  return ((w[0] || "")[0] + ((w[1] || "")[0] || "")).toUpperCase();
};
const slug = (s: string) => norm(s).replace(/&/g, "och").replace(/[^a-z0-9]+/g, "");

/** Five booleans: which stars are filled for a rating. */
export const starFills = (rating: number | null | undefined) =>
  [1, 2, 3, 4, 5].map((i) => i <= Math.round(rating || 0));

/* ------------------------------------------------------------------ */
/* Cities and categories                                               */
/* ------------------------------------------------------------------ */

type CityRow = [string, string, string, number, number, 1 | 2 | 3, string, string[]];
const cityRows: CityRow[] = [
  ["stockholm", "Stockholm", "Stockholms län", 59.3293, 18.0686, 3, "116", ["Södermalm", "Vasastan", "Östermalm", "Kungsholmen", "Hammarby Sjöstad"]],
  ["goteborg", "Göteborg", "Västra Götaland", 57.7089, 11.9746, 3, "413", ["Linné", "Majorna", "Haga", "Vasastaden", "Inom Vallgraven"]],
  ["malmo", "Malmö", "Skåne", 55.605, 13.0038, 3, "214", ["Möllevången", "Davidshall", "Västra Hamnen", "Limhamn", "Rörsjöstaden"]],
  ["uppsala", "Uppsala", "Uppsala län", 59.8586, 17.6389, 2, "753", ["Centrum", "Luthagen", "Svartbäcken", "Kåbo"]],
  ["vasteras", "Västerås", "Västmanland", 59.6099, 16.5448, 2, "722", ["Centrum", "Kungsängen", "Viksäng", "Hammarby"]],
  ["orebro", "Örebro", "Örebro län", 59.2741, 15.2066, 2, "702", ["Centrum", "Väster", "Söder", "Adolfsberg"]],
  ["linkoping", "Linköping", "Östergötland", 58.4108, 15.6214, 2, "582", ["Innerstaden", "Vasastaden", "Ryd", "Tannefors"]],
  ["helsingborg", "Helsingborg", "Skåne", 56.0465, 12.6945, 2, "252", ["Centrum", "Tågaborg", "Råå", "Söder"]],
  ["jonkoping", "Jönköping", "Jönköpings län", 57.7826, 14.1618, 2, "553", ["Öster", "Väster", "Tändsticksområdet", "Huskvarna"]],
  ["norrkoping", "Norrköping", "Östergötland", 58.5877, 16.1924, 2, "602", ["Inre staden", "Knäppingsborg", "Kneippen", "Klingsberg"]],
  ["lund", "Lund", "Skåne", 55.7047, 13.191, 2, "222", ["Centrum", "Väster", "Klostergården", "Norra Fäladen"]],
  ["umea", "Umeå", "Västerbotten", 63.8258, 20.263, 2, "903", ["Centrum", "Haga", "Väst på stan", "Ålidhem"]],
  ["gavle", "Gävle", "Gävleborg", 60.6749, 17.1413, 1, "803", ["Centrum", "Söder", "Brynäs", "Gamla Gefle"]],
  ["boras", "Borås", "Västra Götaland", 57.721, 12.9401, 1, "503", ["Centrum", "Norrby", "Hässleholmen", "Göta"]],
  ["sodertalje", "Södertälje", "Stockholms län", 59.1955, 17.6253, 1, "151", ["Centrum", "Västergård", "Östertälje"]],
  ["eskilstuna", "Eskilstuna", "Södermanland", 59.3666, 16.5077, 1, "632", ["Centrum", "Fröslunda", "Årby"]],
  ["halmstad", "Halmstad", "Halland", 56.6745, 12.8578, 1, "302", ["Centrum", "Söder", "Tylösand", "Frösakull"]],
  ["vaxjo", "Växjö", "Kronoberg", 56.8777, 14.8091, 1, "352", ["Centrum", "Teleborg", "Öster"]],
  ["karlstad", "Karlstad", "Värmland", 59.4022, 13.5115, 1, "652", ["Centrum", "Haga", "Klara", "Våxnäs"]],
  ["sundsvall", "Sundsvall", "Västernorrland", 62.3908, 17.3069, 1, "852", ["Stenstaden", "Haga", "Bosvedjan"]],
  ["lulea", "Luleå", "Norrbotten", 65.5848, 22.1547, 1, "972", ["Centrum", "Notviken", "Porsön", "Svartöstaden"]],
  ["trollhattan", "Trollhättan", "Västra Götaland", 58.2837, 12.2886, 1, "461", ["Centrum", "Strömslund", "Lextorp"]],
  ["ostersund", "Östersund", "Jämtland", 63.1792, 14.6357, 1, "831", ["Centrum", "Frösön", "Odenslund"]],
  ["kalmar", "Kalmar", "Kalmar län", 56.6634, 16.3568, 1, "392", ["Kvarnholmen", "Malmen", "Berga"]],
  ["falun", "Falun", "Dalarna", 60.6065, 15.6355, 1, "791", ["Centrum", "Östanfors", "Hosjö"]],
];

export const cities: City[] = cityRows.map(([id, name, region, lat, lng, size, zip, hoods]) => ({
  id,
  name,
  region,
  lat,
  lng,
  size,
  zip,
  hoods,
}));

type SubSeed = Omit<Subcategory, "cat">;
const S = (
  id: string,
  name: string,
  plural: string,
  img: string,
  hours: WeekHours,
  names: string[],
  desc: string[],
  services: Service[],
): SubSeed => ({ id, name, plural, img, hours, names, desc, services });

type CategorySeed = Omit<Category, "subs"> & { subs: SubSeed[] };
const categorySeeds: CategorySeed[] = [
  {
    id: "mat", name: "Restauranger & caféer", icon: "utensils-crossed", hue: 60, bid: 1.2, blurb: "Lunch, middag och fika",
    subs: [
      S("restaurang", "Restaurang", "Restauranger", "matsal", H("11-22", "12-23", "12-21"), ["Bistro Lykta", "Matsal {hood}", "Krögarn", "Trattoria Sole", "Brasseri Hamn", "Kök Nord", "Gästis {city}", "Smakhuset"], ["Säsongsbaserad husmanskost med naturvin och en meny som byts varje vecka.", "Kvartersrestaurang i {hood} med öppen eld, delningsrätter och lång bardisk.", "Lokala råvaror, en kort meny och bord att boka för större sällskap."], [["Dagens lunch", "135 kr", "Vardagar 11–14"], ["Avsmakningsmeny, fem rätter", "695 kr", ""], ["Bordsbokning", "Gratis", "Online eller per telefon"]]),
      S("cafe", "Café", "Caféer", "kafé", H("7:30-18", "9-17", "9-17"), ["Café Kanel", "Fika & Fönster", "Kafé Linden", "Rosteriet", "Mjölk & Bönor", "Kaffebaren {hood}", "Bryggkaffe", "Café Söder"], ["Eget rosteri, surdegsbullar och sittplatser vid stora fönster mot gatan.", "Lugnt kvarterscafé i {hood} med hembakat, soppa till lunch och bra wifi.", "Specialkaffe, smörgåsar och en uteservering som är öppen så länge vädret tillåter."], [["Kanelbulle", "38 kr", "Bakas varje morgon"], ["Filterkaffe med påtår", "35 kr", ""], ["Lunchsoppa", "115 kr", "Vardagar"]]),
      S("bageri", "Bageri", "Bagerier", "bröd", H("7-18", "8-15", "8-14"), ["Surdegsbageriet", "Bageri Vete", "Mjöl & Sten", "Ugnen {hood}", "Brödboden", "Bagarstugan"], ["Stenugnsbakat bröd, kardemummaknutar och tårtor på beställning.", "Litet bageri med långjästa bröd och tidig öppning för morgonpigga."], [["Surdegslimpa", "68 kr", ""], ["Kardemummaknut", "39 kr", ""], ["Tårta på beställning", "från 450 kr", "Beställ två dagar innan"]]),
    ],
  },
  {
    id: "skonhet", name: "Frisörer & skönhet", icon: "scissors", hue: 350, bid: 1.0, blurb: "Klippning, färg och skönhetsbehandlingar",
    subs: [
      S("frisor", "Frisör", "Frisörer", "salong", H("9-19", "10-16", null), ["Studio Björk", "Salong {hood}", "Hårhuset", "Klippoteket", "Salong Nord", "Lugg & Lockar", "Atelier Hår", "Saxen"], ["Klippning och färg i en ljus salong i {hood}, med fokus på naturliga resultat och hållbara produkter.", "Erfarna frisörer, enkel onlinebokning och tider även på kvällar.", "Liten salong med tre stolar, personlig service och lugn musik."], [["Klippning", "650 kr", "45 min"], ["Färg och klippning", "1 650 kr", "2 tim"], ["Slingor", "1 450 kr", "1,5 tim"], ["Barnklippning", "350 kr", "30 min"]]),
      S("barberare", "Barberare", "Barberare", "barberarstol", H("10-19", "10-16", null), ["Rakverket", "Barber Söder", "Herrfrisören", "Kniv & Kam", "Barbershop {city}", "Mustaschen"], ["Klassisk herrklippning, skäggtrimning och varm handduk.", "Drop-in under dagen och tider att boka på kvällen."], [["Herrklippning", "450 kr", "30 min"], ["Skäggtrimning", "300 kr", "20 min"], ["Klippning och skägg", "690 kr", "50 min"]]),
      S("hudvard", "Hudvård", "Hudvårdssalonger", "behandlingsrum", H("9-19", "10-16", null), ["Hudoteket", "Klinik Lyster", "Salong Silke", "Ansiktet", "Spa {hood}", "Hudstudion"], ["Ansiktsbehandlingar anpassade efter din hud, utförda av utbildade hudterapeuter.", "Lugn salong för ansiktsbehandlingar, fransar och bryn."], [["Klassisk ansiktsbehandling", "895 kr", "60 min"], ["Bryn och fransar", "495 kr", "30 min"], ["Hudkonsultation", "Gratis", "15 min"]]),
    ],
  },
  {
    id: "traning", name: "Träning & hälsa", icon: "dumbbell", hue: 155, bid: 1.1, blurb: "Gym, yoga och behandlingar",
    subs: [
      S("gym", "Gym", "Gym", "träningshall", H("5-23", "7-21", "7-21"), ["Kraftverket", "Gym {hood}", "Pulshuset", "Stålverket", "Rörelse", "Atletklubben"], ["Rymligt gym med fria vikter, gruppträning och öppet från tidig morgon till sen kväll.", "Mindre gym utan bindningstid, med introduktion för nya medlemmar."], [["Månadskort", "449 kr/mån", "Ingen bindningstid"], ["Dagskort", "150 kr", ""], ["Personlig träning", "795 kr", "60 min"]]),
      S("yoga", "Yogastudio", "Yogastudior", "yogasal", H("7-21", "9-16", "9-16"), ["Yogarummet", "Studio Andas", "Asana {hood}", "Lotushuset", "Yoga Sal", "Andetaget"], ["Små klasser i vinyasa, yin och hatha för alla nivåer.", "Varm studio i {hood} med morgonpass och nybörjarkurser."], [["Drop-in", "220 kr", "75 min"], ["Klippkort, tio pass", "1 800 kr", ""], ["Nybörjarkurs", "1 200 kr", "Fyra veckor"]]),
      S("fysio", "Fysioterapeut", "Fysioterapeuter", "klinik", H("8-18", null, null), ["Fysiokliniken {hood}", "Rörelseklinik", "Fysio & Form", "Ryggkliniken", "Kliniken Balans", "Rehab {city}"], ["Legitimerade fysioterapeuter för idrottsskador, rygg och nacke.", "Bedömning, behandling och ett träningsprogram som du tar med dig hem."], [["Nybesök", "650 kr", "45 min"], ["Återbesök", "550 kr", "30 min"], ["Massage", "695 kr", "50 min"]]),
    ],
  },
  {
    id: "bil", name: "Bil & motor", icon: "car", hue: 245, bid: 0.9, blurb: "Service, däck och biltvätt",
    subs: [
      S("verkstad", "Bilverkstad", "Bilverkstäder", "verkstad", H("7-17", null, null), ["{hood} Bilservice", "Motorverkstan", "Bilkliniken", "Verkstan {city}", "Kolv & Kardan", "Bilmekano"], ["Service och reparationer av alla bilmärken, med fast pris innan arbetet börjar.", "Familjeägd verkstad med lånebil och besked samma dag."], [["Service", "från 2 495 kr", "Enligt tillverkarens schema"], ["Felsökning", "695 kr", "30 min"], ["AC-service", "1 295 kr", ""]]),
      S("dack", "Däckverkstad", "Däckverkstäder", "däckhall", H("7-17", "9-14", null), ["Däckcentralen", "Fälg & Däck", "Däckhotellet {city}", "Hjulbyte {hood}", "Gummiverkstan", "DäckDirekt"], ["Hjulskifte utan lång väntetid, däckhotell och nya däck till bra priser.", "Boka hjulskifte online. Vi förvarar dina däck till nästa säsong."], [["Hjulskifte", "395 kr", "20 min"], ["Däckhotell", "895 kr/säsong", ""], ["Balansering", "495 kr", ""]]),
      S("biltvatt", "Biltvätt", "Biltvättar", "tvätthall", H("8-18", "10-15", null), ["Glans Biltvätt", "Tvätthallen", "Rena Bilar", "Biltvätten {hood}", "Skum & Glans", "Handtvätten"], ["Handtvätt, rekond och invändig rengöring medan du väntar.", "Skonsam handtvätt och rekond med miljömärkta medel."], [["Handtvätt utvändigt", "349 kr", "30 min"], ["Invändig rengöring", "595 kr", "45 min"], ["Helrekond", "2 495 kr", "4 tim"]]),
    ],
  },
  {
    id: "bygg", name: "Bygg & hantverk", icon: "hammer", hue: 80, bid: 1.3, blurb: "Snickare, elektriker och rörmokare",
    covers: ["/images/categories/bygg.jpg"],
    subs: [
      S("snickare", "Snickare", "Snickare", "snickeri", H("7-16", null, null), ["Snickeri {hood}", "Hyvel & Söner", "Byggverket", "Trä & Form", "Snickarna i {city}", "Fogen Bygg"], ["Renoveringar, platsbyggd förvaring och altaner. ROT-avdraget dras direkt på fakturan.", "Mindre byggjobb och köksrenoveringar med fast offert."], [["Timpris", "650 kr/tim", "Före ROT-avdrag"], ["Platsbyggd garderob", "Offert", ""], ["Hembesök och offert", "Gratis", ""]]),
      S("elektriker", "Elektriker", "Elektriker", "elinstallation", H("7-16", null, null), ["Elfirman {city}", "Kontakten El", "Strömbolaget", "Volt & Watt", "Elgruppen {hood}", "Ljusa El"], ["Behöriga elektriker för installationer, laddboxar och felsökning.", "Elinstallationer i hem och lokaler, med jour på vardagar."], [["Timpris", "695 kr/tim", "Före ROT-avdrag"], ["Installation av laddbox", "från 9 900 kr", ""], ["Felsökning", "Offert", ""]]),
      S("ror", "Rörmokare", "Rörmokare", "badrum", H("7-16", null, null), ["Rörkliniken", "VVS {hood}", "Kranen Rör", "Rörfixarna", "Vattenverket VVS", "Rör & Värme {city}"], ["VVS-installationer, badrumsrenoveringar och hjälp vid akuta läckor.", "Certifierade rörmokare för badrum och kök, med jour."], [["Timpris", "725 kr/tim", "Före ROT-avdrag"], ["Byte av blandare", "från 1 900 kr", ""], ["Badrumsrenovering", "Offert", ""]]),
    ],
  },
  {
    id: "hem", name: "Hem & trädgård", icon: "sprout", hue: 130, bid: 0.8, blurb: "Florister, städning och trädgård",
    subs: [
      S("florist", "Florist", "Florister", "buketter", H("10-18", "10-15", null), ["Blomsterateljén", "Bukett {hood}", "Floristen", "Vildblomma", "Ros & Rams", "Blomsterboden"], ["Säsongens blommor, buketter på beställning och leverans samma dag.", "Krukväxter, snittblommor och binderier till fest och vardag."], [["Säsongsbukett", "från 395 kr", ""], ["Leverans", "149 kr", "Samma dag i stan"], ["Bröllopsbinderi", "Offert", ""]]),
      S("stad", "Städfirma", "Städfirmor", "ljust hem", H("8-17", null, null), ["Rent Hem", "Städhjälpen {city}", "Glänsa Städ", "Dammfritt", "Städbolaget {hood}", "Puts & Städ"], ["Hemstädning varannan vecka med samma städare och RUT-avdrag direkt på fakturan.", "Flyttstädning, fönsterputs och storstädning med städgaranti."], [["Hemstädning", "från 299 kr/tim", "Efter RUT-avdrag"], ["Flyttstädning", "Offert", "Med städgaranti"], ["Fönsterputs", "från 595 kr", ""]]),
      S("tradgard", "Trädgårdsmästare", "Trädgårdsmästare", "trädgård", H("7-16", null, null), ["Gröna Händer", "Trädgårdsfirman", "Gräs & Gren", "Planteringen", "Lövet Trädgård", "Häck & Hage"], ["Trädgårdsskötsel, beskärning och plantering året runt.", "Från häckklippning till nya rabatter, med RUT-avdrag på det mesta."], [["Trädgårdsskötsel", "från 350 kr/tim", "Efter RUT-avdrag"], ["Beskärning", "Offert", ""], ["Trädgårdsdesign", "Offert", ""]]),
    ],
  },
  {
    id: "shopping", name: "Shopping", icon: "shopping-bag", hue: 300, bid: 0.9, blurb: "Kläder, böcker och second hand",
    subs: [
      S("klader", "Klädbutik", "Klädbutiker", "butik", H("10-19", "10-17", "11-16"), ["Butik Vardag", "Ateljé {hood}", "Plagg", "Söm & Stil", "Garderoben", "Nordisk Form"], ["Skandinaviska märken, tidlösa plagg och personlig service.", "Kläder och accessoarer från små europeiska designers."], [["Personlig shopping", "Gratis", "Boka 45 min"], ["Presentkort", "från 200 kr", ""], ["Ändringssömnad", "från 250 kr", ""]]),
      S("secondhand", "Second hand", "Second hand-butiker", "vintage", H("11-18", "10-16", "12-16"), ["Andra Varvet", "Retro {hood}", "Återbruket", "Vintagehörnan", "Igen", "Loppisboden"], ["Noga utvald vintage och second hand som fylls på varje vecka.", "Kläder, möbler och prylar med en historia. Vi tar emot inlämning."], [["Inlämning", "Gratis", "Vardagar"], ["Vintagejeans", "från 349 kr", ""], ["Hemhämtning", "299 kr", ""]]),
      S("bokhandel", "Bokhandel", "Bokhandlar", "bokhyllor", H("10-19", "10-17", "11-16"), ["Bokhandeln {hood}", "Pärmen", "Bokstaven", "Sidorna", "Läshörnan", "Kapitel Ett"], ["Oberoende bokhandel med noga utvalt sortiment och läsecirklar.", "Nya böcker, pocket och barnböcker. Det mesta kan beställas hem."], [["Beställning", "Gratis", "2–4 dagar"], ["Läsecirkel", "150 kr", "Varje månad"], ["Presentinslagning", "Gratis", ""]]),
    ],
  },
  {
    id: "tjanster", name: "Tjänster", icon: "briefcase", hue: 215, bid: 1.0, blurb: "Redovisning, flytt och skrädderi",
    subs: [
      S("redovisning", "Redovisningsbyrå", "Redovisningsbyråer", "kontor", H("8:30-17", null, null), ["Siffror & Co", "Byrån {city}", "Bokslutet", "Kalkylen", "Redo Redovisning", "Balans Ekonomi"], ["Bokföring, deklarationer och rådgivning för små företag.", "Auktoriserade redovisningskonsulter med fast månadspris."], [["Löpande bokföring", "från 1 495 kr/mån", ""], ["Bokslut och årsredovisning", "Offert", ""], ["Privat deklaration", "995 kr", ""]]),
      S("flytt", "Flyttfirma", "Flyttfirmor", "flyttbil", H("7-18", "9-15", null), ["Flyttgubbarna", "Lyft Flytt", "Bärkraft", "Flytt & Förråd {city}", "Kartongen", "Smidig Flytt"], ["Flytt, packning och magasinering med försäkring och RUT-avdrag.", "Erfarna flyttare för lägenheter och kontor, även på helger."], [["Flytthjälp", "från 495 kr/tim", "Efter RUT-avdrag"], ["Packhjälp", "Offert", ""], ["Magasinering", "från 595 kr/mån", ""]]),
      S("skradderi", "Skrädderi", "Skrädderier", "ateljé", H("10-18", "11-15", null), ["Skrädderiet {hood}", "Nål & Tråd", "Sömmerskan", "Fållen", "Stygnet", "Måttbeställt"], ["Ändringar, lagningar och måttsydda kostymer.", "Snabba ändringar som ofta är klara samma vecka."], [["Fållning av byxor", "250 kr", ""], ["Byte av dragkedja", "350 kr", ""], ["Måttsydd kostym", "Offert", ""]]),
    ],
  },
];

/** Photos for categories that don't have their own. */
const DEFAULT_COVERS = ["/images/categories/storefront-1.jpg", "/images/categories/storefront-2.jpg"];

export const categories: Category[] = categorySeeds.map((c) => ({
  ...c,
  covers: c.covers ?? DEFAULT_COVERS,
  subs: c.subs.map((s) => ({ ...s, cat: c.id })),
}));

/** A stable pick from a list, so a business always gets the same photo. */
function pickFor<T>(id: string, list: T[] | undefined): T | undefined {
  if (!list?.length) return undefined;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}

const REVIEWS: Record<string, string[]> = {
  mat: ["Bästa lunchen i området. Trevlig personal och snabb service även när det är fullt.", "Mysig stämning och riktigt god mat. Vi kommer tillbaka.", "Bra kaffe och fina bullar. Lite trångt på helgerna.", "Prisvärt och gott. Rekommenderar dagens."],
  skonhet: ["Superbra klippning. Frisören lyssnade verkligen på vad jag ville ha.", "Lätt att boka och de höll tiden. Mycket nöjd med färgen.", "Trevlig salong och avslappnad stämning. Kommer tillbaka.", "Bra resultat, men lite dyrt."],
  traning: ["Rent och fräscht, och sällan trångt på morgonen.", "Instruktörerna är kunniga och peppande.", "Fick bra hjälp med ryggen efter några besök.", "Bra utrustning, men omklädningsrummen kunde vara större."],
  bil: ["Ärliga besked och priset blev det de sa från början.", "Snabb service och de ringde innan de gjorde något extra.", "Smidigt hjulbyte, klart på tjugo minuter.", "Bilen blev som ny. Rekommenderas."],
  bygg: ["Kom i tid, städade efter sig och höll offerten.", "Hjälpte oss med hela köket. Noggranna och lätta att ha att göra med.", "Snabbt svar och bra jobb med laddboxen.", "Bra hantverk, men det tog ett tag att få en tid."],
  hem: ["Fantastiska buketter och alltid ett trevligt bemötande.", "Samma städare varje gång och alltid noggrant.", "Trädgården har aldrig sett bättre ut.", "Bra service och enkelt att boka."],
  shopping: ["Fint sortiment och personal som kan sina saker.", "Hittade en riktig pärla. Kommer definitivt tillbaka.", "Mysig butik med bra boktips.", "Bra kvalitet, något högre priser."],
  tjanster: ["Tydliga besked och snabba svar på mejl.", "Flytten gick smidigt och inget gick sönder.", "Ändrade kostymen på en dag. Perfekt passform.", "Bra hjälp med bokslutet och prisvärt."],
};
const NAMES = ["Anna L.", "Johan S.", "Sara K.", "Erik N.", "Maja P.", "Oskar B.", "Elin H.", "Ali R.", "Fatima M.", "Karin J.", "Lukas E.", "Nora W.", "Hassan A.", "Ida G.", "Mikael T.", "Leila S."];
const STREETS = ["Storgatan", "Drottninggatan", "Kungsgatan", "Nygatan", "Hamngatan", "Skolgatan", "Järnvägsgatan", "Kyrkogatan", "Södra Långgatan", "Torggatan", "Trädgårdsgatan", "Bryggargatan", "Parkgatan", "Ågatan", "Västra vägen", "Esplanaden", "Fabriksgatan", "Smedjegatan"];

// Lookup tables have no prototype, so ids like "constructor" from a URL never match.
const table = <T,>(): Record<string, T> => Object.create(null);

export const cityById = table<City>();
export const catById = table<Category>();
export const subById = table<Subcategory>();
cities.forEach((c) => (cityById[c.id] = c));
categories.forEach((c) => {
  catById[c.id] = c;
  c.subs.forEach((s) => (subById[s.id] = s));
});

export const DEFAULT_CITY = "stockholm";
export const isCity = (id: string | null | undefined): id is string => !!id && id in cityById;

/* ------------------------------------------------------------------ */
/* Businesses                                                          */
/* ------------------------------------------------------------------ */

type BusinessSeed = Pick<
  Business,
  | "id" | "name" | "cat" | "sub" | "city" | "hood" | "address" | "lat" | "lng" | "rating" | "reviews"
  | "trend" | "added" | "pop" | "desc" | "about" | "services" | "hours" | "phone" | "web" | "insta" | "founded"
>;

/** Normalised strings used by search, kept off the public Business object. */
const searchIndex = new Map<string, { n: string; sub: string; cat: string; hood: string; rest: string }>();

function finish(seed: BusinessSeed): Business {
  const c = cityById[seed.city], cat = catById[seed.cat], sub = subById[seed.sub];
  const hasRating = seed.rating != null;
  const b: Business = {
    ...seed,
    sponsored: false,
    cityName: c.name,
    catName: cat.name,
    subName: sub.name,
    subPlural: sub.plural,
    icon: cat.icon,
    cover: pickFor(seed.id, cat.covers),
    tone: `oklch(0.935 0.028 ${cat.hue})`,
    toneInk: `oklch(0.42 0.07 ${cat.hue})`,
    initials: initials(seed.name),
    imgLabel: sub.img,
    hasRating,
    ratingText: hasRating ? seed.rating!.toFixed(1).replace(".", ",") : "",
    reviewsText: seed.reviews === 1 ? "1 omdöme" : nf(seed.reviews) + " omdömen",
    reviewsShort: "(" + nf(seed.reviews) + ")",
    hasTrend: seed.trend > 0,
    trendText: seed.trend > 0 ? "+" + seed.trend + " % besök" : "",
    isNew: seed.added < 60,
    place: seed.hood + ", " + c.name,
    bayes: hasRating ? (seed.rating! * seed.reviews + 4.2 * 12) / (seed.reviews + 12) : 0,
    href: "/foretag/" + seed.id,
  };
  searchIndex.set(b.id, {
    n: norm(b.name),
    sub: norm(sub.name + " " + sub.plural),
    cat: norm(cat.name + " " + cat.blurb),
    hood: norm(b.hood),
    rest: norm(b.desc + " " + b.services.map((s) => s[0]).join(" ")),
  });
  return b;
}

export const allBusinesses: Business[] = [];
export const byId = table<Business>();
export const byCity = table<Business[]>();

cities.forEach((c) => {
  byCity[c.id] = [];
  categories.forEach((cat) => {
    cat.subs.forEach((sub) => {
      const r = rng(c.id + ":" + sub.id);
      const names = shuffle(sub.names.slice(), r).slice(0, c.size + 1);
      names.forEach((pattern, i) => {
        const hood = pick(c.hoods, r);
        const fill = (s: string) => s.replace("{hood}", hood).replace("{city}", c.name);
        const name = fill(pattern);
        const none = r() < 0.1;
        const rating = none ? null : Math.round((3.9 + r() * 0.999) * 10) / 10;
        const reviews = none ? 0 : Math.round(6 + Math.pow(r(), 2) * 380 * (0.5 + c.size * 0.35));
        const trend = r() < 0.2 ? Math.round(18 + r() * 70) : 0;
        const added = none ? Math.floor(r() * 50) : Math.floor(60 + r() * 1400);
        const d1 = fill(pick(sub.desc, r));
        const others = sub.desc.filter((d) => fill(d) !== d1);
        const b = finish({
          id: c.id + "-" + sub.id + "-" + (i + 1),
          name,
          cat: cat.id,
          sub: sub.id,
          city: c.id,
          hood,
          address: pick(STREETS, r) + " " + (1 + Math.floor(r() * 78)) + ", " + c.zip + " " + String(10 + Math.floor(r() * 89)) + " " + c.name,
          lat: c.lat + (r() - 0.5) * 0.035,
          lng: c.lng + (r() - 0.5) * 0.06,
          rating,
          reviews,
          trend,
          added,
          pop: (rating || 3.8) * Math.log(1 + reviews) * 10 + trend * 0.8 + r() * 8,
          desc: d1,
          about: [d1].concat(others.slice(0, 1).map(fill)).join(" "),
          services: sub.services,
          hours: sub.hours,
          phone: "070-174 06 " + String(5 + Math.floor(r() * 94)).padStart(2, "0"),
          web: slug(name) + ".se",
          insta: "@" + slug(name),
          founded: 1988 + Math.floor(r() * 36),
        });
        allBusinesses.push(b);
        byId[b.id] = b;
        byCity[c.id].push(b);
      });
    });
  });
});

// One sponsored position per category and city: the current (fictional) winning bid.
const sponsorByMarket = table<Business>();
cities.forEach((c) => {
  categories.forEach((cat) => {
    const pool = byCity[c.id].filter((b) => b.sub === cat.subs[0].id);
    const good = pool.filter((b) => (b.rating ?? 0) >= 4.3 && b.reviews >= 25);
    const s = pick(good.length ? good : pool, rng("s:" + c.id + cat.id));
    s.sponsored = true;
    sponsorByMarket[c.id + ":" + cat.id] = s;
  });
});

// The demo owner's business.
const own = finish({
  id: "studio-ljung", name: "Studio Ljung", cat: "skonhet", sub: "frisor", city: "malmo", hood: "Möllevången",
  address: "Bergsgatan 21, 214 22 Malmö", lat: 55.5935, lng: 13.0045, rating: 4.8, reviews: 214, trend: 34, added: 820,
  pop: 0,
  desc: "Klippning, färg och balayage i en ljus salong vid Möllevångstorget. Vi jobbar med veganska produkter och tar oss tid för konsultationen.",
  about: "Klippning, färg och balayage i en ljus salong vid Möllevångstorget. Vi jobbar med veganska produkter och tar oss tid för konsultationen. Fyra frisörer, kvällstider tisdag till torsdag och alltid en kopp kaffe.",
  services: [["Klippning", "650 kr", "45 min"], ["Färg och klippning", "1 650 kr", "2 tim"], ["Balayage", "2 450 kr", "3 tim"], ["Barnklippning", "350 kr", "30 min"]],
  hours: H("9-19", "10-16", null), phone: "070-174 06 21", web: "studioljung.se", insta: "@studioljung", founded: 2016,
});
own.pop = own.rating! * Math.log(1 + own.reviews) * 10 + own.trend * 0.8 - 6;
allBusinesses.push(own);
byId[own.id] = own;
byCity.malmo.push(own);

/* ------------------------------------------------------------------ */
/* Search and listing                                                  */
/* ------------------------------------------------------------------ */

function tokens(q: string) {
  return norm(q)
    .split(/[\s,]+/)
    .filter((t) => t.length > 1 && t !== "i" && !cities.some((c) => norm(c.name) === t));
}

function score(b: Business, toks: string[]) {
  const ix = searchIndex.get(b.id)!;
  let total = 0;
  for (const t of toks) {
    let s = 0;
    if (ix.n.indexOf(t) === 0) s += 8;
    else if (ix.n.includes(t)) s += 5;
    if (ix.sub.includes(t)) s += 6;
    if (ix.cat.includes(t)) s += 3;
    if (ix.hood.includes(t)) s += 3;
    if (ix.rest.includes(t)) s += 1;
    if (!s) return 0;
    total += s;
  }
  return total;
}

/** `now` must be a Stockholm wall-clock date, see lib/time.ts. */
export function isOpen(b: Business, now: Date) {
  const h = b.hours[now.getDay()], m = now.getHours() * 60 + now.getMinutes();
  return !!h && m >= h[0] && m < h[1];
}

export function openStatus(b: Business, now: Date): OpenStatus {
  const d = now.getDay(), m = now.getHours() * 60 + now.getMinutes(), h = b.hours[d];
  if (h && m >= h[0] && m < h[1]) return { open: true, label: "Öppet nu", detail: "stänger " + hm(h[1]) };
  if (h && m < h[0]) return { open: false, label: "Stängt", detail: "öppnar " + hm(h[0]) };
  for (let i = 1; i <= 7; i++) {
    const dd = (d + i) % 7, next = b.hours[dd];
    if (next) return { open: false, label: "Stängt", detail: "öppnar " + (i === 1 ? "i morgon" : DAYS[dd]) + " " + hm(next[0]) };
  }
  return { open: false, label: "Stängt", detail: "" };
}

export function hoursList(b: Business, now: Date): HoursRow[] {
  return WEEK_ORDER.map((i) => {
    const h = b.hours[i];
    return { day: DAYS_LONG[i], text: h ? hm(h[0]) + "–" + hm(h[1]) : "Stängt", today: i === now.getDay(), closed: !h };
  });
}

export const sorts: SortOption[] = [
  { id: "popular", label: "Populärast", hint: "Flest besök och omdömen" },
  { id: "rating", label: "Högst betyg", hint: "Betyg viktat mot antal omdömen" },
  { id: "new", label: "Nyast", hint: "Senast tillagda först" },
  { id: "relevance", label: "Relevans", hint: "Bäst matchning mot din sökning" },
];
export const isSort = (s: string | null | undefined): s is SortId => sorts.some((x) => x.id === s);

export function query(o: QueryOptions): QueryResult {
  let list = byCity[o.city] || [];
  if (o.cat) list = list.filter((b) => b.cat === o.cat);
  if (o.sub) list = list.filter((b) => b.sub === o.sub);
  const toks = tokens(o.q || "");
  let rows = list.map((b) => ({ b, s: toks.length ? score(b, toks) : 0 }));
  if (toks.length) rows = rows.filter((x) => x.s > 0);
  if (o.openNow && o.now) {
    const now = o.now;
    rows = rows.filter((x) => isOpen(x.b, now));
  }
  if (o.topRated) rows = rows.filter((x) => (x.b.rating ?? 0) >= 4.5);
  const sort = o.sort || "popular";
  rows.sort((a, b) => {
    if (sort === "rating") return b.b.bayes - a.b.bayes;
    if (sort === "new") return a.b.added - b.b.added;
    if (sort === "relevance") return b.s - a.s || b.b.pop - a.b.pop;
    return b.b.pop - a.b.pop;
  });
  const results = rows.map((x) => x.b);
  const sp = o.cat ? sponsorByMarket[o.city + ":" + o.cat] : null;
  const sponsored = sp && results.includes(sp) ? sp : null;
  return { results, sponsored, total: results.length };
}

export function suggest(q: string, city: string): SuggestGroup[] {
  const n = norm(q).trim();
  const groups: SuggestGroup[] = [];
  if (!n) {
    groups.push({
      label: "Populära kategorier",
      items: ["frisor", "restaurang", "gym", "verkstad", "cafe"].map((id) => {
        const s = subById[id];
        return { kind: "sub", id, cat: s.cat, label: s.plural, meta: catById[s.cat].name, icon: catById[s.cat].icon };
      }),
    });
    return groups;
  }
  const subs: SuggestGroup["items"] = [];
  categories.forEach((c) =>
    c.subs.forEach((s) => {
      if (norm(s.name + " " + s.plural).includes(n) || norm(c.name).includes(n))
        subs.push({ kind: "sub", id: s.id, cat: c.id, label: s.plural, meta: c.name, icon: c.icon });
    }),
  );
  if (subs.length) groups.push({ label: "Kategorier", items: subs.slice(0, 4) });
  const toks = tokens(q);
  if (toks.length) {
    const biz = (byCity[city] || [])
      .map((b) => ({ b, s: score(b, toks) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || b.b.pop - a.b.pop)
      .slice(0, 4);
    if (biz.length)
      groups.push({
        label: "Företag i " + cityById[city].name,
        items: biz.map((x) => ({
          kind: "biz", id: x.b.id, label: x.b.name, meta: x.b.subName + " · " + x.b.hood,
          initials: x.b.initials, tone: x.b.tone, toneInk: x.b.toneInk,
        })),
      });
  }
  const cs = cities.filter((c) => norm(c.name).indexOf(n) === 0).slice(0, 2);
  if (cs.length)
    groups.push({
      label: "Städer",
      items: cs.map((c) => ({ kind: "city", id: c.id, label: "Allt i " + c.name, meta: c.region, icon: "map-pin" })),
    });
  return groups;
}

/** Exact match of a free-text query against a subcategory name ("frisörer"). */
export function matchSub(q: string): Subcategory | null {
  const n = norm(q).trim();
  if (!n) return null;
  for (const c of categories) for (const s of c.subs) if (norm(s.name) === n || norm(s.plural) === n) return s;
  return null;
}

/** Home page "Populärt just nu": one sponsored slot plus the fastest-growing businesses. */
export function trending(city: string): Business[] {
  const r = rng("h:" + city);
  const sp = sponsorByMarket[city + ":" + pick(["mat", "skonhet", "traning"], r)];
  const t = byCity[city]
    .filter((b) => b.trend > 0 && b !== sp && b.hasRating)
    .sort((a, b) => b.trend - a.trend)
    .slice(0, 3);
  return [sp, ...t];
}

export function related(b: Business): Business[] {
  const byPop = (x: Business, y: Business) => y.pop - x.pop;
  const same = byCity[b.city].filter((x) => x.sub === b.sub && x !== b);
  const cat = byCity[b.city].filter((x) => x.cat === b.cat && x.sub !== b.sub);
  return same.sort(byPop).concat(cat.sort(byPop)).slice(0, 4);
}

export const countIn = (city: string, cat?: string) =>
  (byCity[city] || []).filter((b) => !cat || b.cat === cat).length;

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export function reviewsFor(b: Business, now: Date): Review[] {
  if (!b.reviews) return [];
  const r = rng("r:" + b.id), pool = REVIEWS[b.cat];
  let days = 1;
  return shuffle([0, 1, 2, 3], r)
    .slice(0, 3)
    .map((k) => {
      days += 2 + Math.floor(r() * 18);
      const st = Math.max(3, Math.min(5, Math.round((b.rating ?? 4) + (r() - 0.35))));
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
      const name = pick(NAMES, r);
      return { id: b.id + "-r" + k, name, initial: name[0], rating: st, text: pool[k], date: fmtDay(d) + " " + d.getFullYear() };
    });
}

export function ratingDist(b: Business): RatingBar[] {
  if (!b.reviews || b.rating == null) return [];
  const five = Math.max(30, Math.min(90, Math.round((b.rating - 3.6) * 52)));
  const four = Math.round((100 - five) * 0.62);
  const three = Math.round((100 - five - four) * 0.6);
  const two = Math.round((100 - five - four - three) * 0.6);
  const one = Math.max(0, 100 - five - four - three - two);
  return [[5, five], [4, four], [3, three], [2, two], [1, one]].map(([stars, pct]) => ({ stars, pct }));
}

/* ------------------------------------------------------------------ */
/* Tipsly Boost: weekly sponsored-placement auctions                   */
/* ------------------------------------------------------------------ */

function isoWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const n = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - n);
  const y = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - y.getTime()) / 864e5 + 1) / 7);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * Weekly rounds: a placement runs Mon 00:00 – Sun 23:59. Bidding for next
 * week closes Sunday 20:00. `now` is a Stockholm wall-clock date.
 */
export function periods(now: Date): Periods {
  let monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  let close = addDays(monday, 6);
  close.setHours(20, 0, 0, 0);
  if (now >= close) {
    monday = addDays(monday, 7);
    close = addDays(close, 7);
  }
  const nextMon = addDays(monday, 7), nextSun = addDays(monday, 13);
  return {
    current: { start: monday, end: addDays(monday, 6), week: isoWeek(monday), range: fmtRange(monday, addDays(monday, 6)) },
    next: { start: nextMon, end: nextSun, week: isoWeek(nextMon), range: fmtRange(nextMon, nextSun) },
    closesAt: close,
    closesText: DAYS[close.getDay()] + " " + fmtDay(close) + " kl. 20:00",
    endsText: DAYS[addDays(monday, 6).getDay()] + " " + fmtDay(addDays(monday, 6)),
    startsText: DAYS[nextMon.getDay()] + " " + fmtDay(nextMon),
    past: [2, 4, 6].map((w) => {
      const s = addDays(monday, -7 * w);
      return { week: isoWeek(s), range: fmtRange(s, addDays(s, 6)) };
    }),
  };
}

export const BOOST_MIN_BID = 500;
export const BOOST_STEP = 50;
export const BOOST_MAX_BID = 50000;

export function market(city: string, cat: string): Market {
  const c = cityById[city], k = catById[cat], r = rng("m:" + city + cat);
  const leading = Math.round(([0, 600, 950, 1400][c.size] * k.bid) / 50) * 50;
  const amounts = [leading];
  const n = 2 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) amounts.push(Math.max(500, amounts[amounts.length - 1] - 50 * (1 + Math.floor(r() * 4))));
  const times = ["i dag 09:14", "i dag 08:02", "i går 17:40", "i går 11:26", "mån 15:08"];
  const bids: Bid[] = amounts.map((a, i) => ({ who: "Budgivare " + "ABCDE"[i], amount: a, time: times[i], mine: false }));
  return { leading, minBid: BOOST_MIN_BID, step: BOOST_STEP, sponsor: sponsorByMarket[city + ":" + cat], bids };
}

/* ------------------------------------------------------------------ */
/* Demo business owner                                                 */
/* ------------------------------------------------------------------ */

function ownerStats(now: Date): OwnerStats {
  const r = rng("owner-visits");
  const days: OwnerStats["days"] = [];
  for (let i = 29; i >= 0; i--) {
    const d = addDays(now, -i - 1), dow = d.getDay();
    const boosted = i + 1 >= 11 && i + 1 <= 17;
    const v = 62 + Math.sin(i / 3) * 8 + (dow === 5 || dow === 6 ? 18 : 0) + (dow === 0 ? -14 : 0) + r() * 16 + (boosted ? 58 : 0);
    days.push({ label: DAYS[dow] + " " + fmtDay(d), value: Math.round(v), boosted });
  }
  const total = days.reduce((s, d) => s + d.value, 0);
  return {
    days,
    kpis: [
      { label: "Profilbesök", value: nf(total), delta: "+18 %", up: true, icon: "eye" },
      { label: "Sparningar", value: "86", delta: "+9 %", up: true, icon: "bookmark" },
      { label: "Klick till webbplats", value: "312", delta: "+12 %", up: true, icon: "mouse-pointer-click" },
      { label: "Samtal", value: "47", delta: "−4 %", up: false, icon: "phone" },
    ],
  };
}

function ownerRank(sort: SortId = "popular") {
  const q = query({ city: own.city, cat: own.cat, sort });
  return { rank: q.results.indexOf(own) + 1, of: q.total };
}

export const owner = {
  name: "Linnea Ljung",
  first: "Linnea",
  email: "linnea@studioljung.se",
  biz: own,
  stats: ownerStats,
  rank: ownerRank,
};

/* ------------------------------------------------------------------ */
/* Curated lists                                                       */
/* ------------------------------------------------------------------ */

export const featuredCities = ["stockholm", "goteborg", "malmo", "uppsala", "orebro", "vasteras", "linkoping", "helsingborg"];

export const popularSearches = [
  { label: "Frisörer", cat: "skonhet", sub: "frisor" },
  { label: "Restauranger", cat: "mat", sub: "restaurang" },
  { label: "Gym", cat: "traning", sub: "gym" },
  { label: "Bilverkstäder", cat: "bil", sub: "verkstad" },
];
