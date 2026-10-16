# Tipsly

Tipsly är en katalog över lokala företag i 25 svenska städer. Besökare söker, filtrerar och jämför företag;
företagare skapar en gratis profil och kan buda på en veckovis, tydligt märkt topplacering (Tipsly Boost).

Sajten är en produktionsversion av designprototypen "Tipsly weekly boost prototype" och återger dess design
och beteende exakt. All data är påhittad demodata.

## Kom igång

Kräver Node.js 20.9 eller senare.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Kommando        | Gör                                   |
| --------------- | ------------------------------------- |
| `npm run dev`   | Utvecklingsserver med hot reload      |
| `npm run build` | Produktionsbygge                      |
| `npm start`     | Kör produktionsbygget                 |
| `npm run lint`  | ESLint                                |

Kopiera `.env.example` till `.env.local` och sätt `NEXT_PUBLIC_SITE_URL` till sajtens publika adress. Den används
för kanoniska länkar, Open Graph och `sitemap.xml`, och först när den är satt får sökmotorer indexera sajten (demo-
versioner på t.ex. vercel.app är markerade noindex). Kartorna använder Esris nyckelfria ljusgrå karta; vill du
använda en kommersiell leverantör (t.ex. CARTO, vars kartor numera kräver API-nyckel) sätter du
`NEXT_PUBLIC_MAP_TILE_URL` och `NEXT_PUBLIC_MAP_ATTRIBUTION`.

## Teknik

- [Next.js 16](https://nextjs.org) (App Router) med React 19 och TypeScript.
- CSS Modules per komponent. Färger, textskala, hörnrundningar, skuggor och animationer är designtokens i
  `src/app/globals.css`; använd dem i stället för fasta pixel- och färgvärden.
- Typsnitten Geist och Geist Mono via `next/font`, ikoner från [Lucide](https://lucide.dev), kartor med
  [Leaflet](https://leafletjs.com).

## Sidor

| URL                                     | Innehåll                                                   |
| --------------------------------------- | ---------------------------------------------------------- |
| `/`                                     | Startsida med sök, städer, populära företag och kategorier |
| `/utforska/[stad]/[kategori]/[under]`   | Lista och karta med sök, sortering och filter              |
| `/foretag/[id]`                         | Företagsprofil                                             |
| `/for-foretag`                          | Information för företag och registrering (`#lagg-till`)    |
| `/konto/oversikt` … `/konto/installningar` | Företagarens dashboard med Tipsly Boost                 |

Sök, sortering, filter och kartvy på listsidorna ligger i adressen (`?q=`, `?sortera=`, `?oppet=1`, `?betyg=1`,
`?vy=karta`) så att en vy går att dela. Besökarens valda stad sparas i en cookie så att servern kan rendera rätt
stad direkt; sparade företag ligger i webbläsarens `localStorage`.

## Struktur

```
src/
  app/              Routes, layout, metadata, sitemap, robots, Open Graph-bild
  components/
    layout/         Header, footer, demobanner, toast
    providers/      Stad, sparade företag och toast (React context)
    ui/             Ikon och stadsväljare
    business/       Företagskortet som används i alla listor
    home/ discover/ profile/ for-business/ dashboard/ boost/
  hooks/            useNow (svensk tid), useDismiss (stäng popovers)
  lib/              Data, typer, URL-byggare, tidshjälpare
```

## Från demo till riktig tjänst

- **Data:** `src/lib/data.ts` genererar katalogen deterministiskt och exponerar funktioner som `query()`,
  `suggest()`, `related()` och `market()`. Byt ut deras innehåll mot anrop till ett API eller en databas;
  komponenterna bryr sig bara om funktionernas signaturer och typerna i `src/lib/types.ts`.
- **Formulär och bud:** registrering, sparad profil och lagda bud simulerar nätverksanrop i små asynkrona
  funktioner i respektive komponentmapp. Det är där de riktiga anropen ska in.
- **Inloggning:** `/konto` visar ett demokonto och är undantaget från sökmotorer. Lägg skyddet framför den
  routen när autentisering finns.
- **Tid:** öppettider, budgivningens deadline och veckonummer räknas alltid i svensk tid (`Europe/Stockholm`),
  oavsett var servern eller besökaren befinner sig.
