"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useToast } from "@/components/providers/app-providers";
import { Icon } from "@/components/ui/icon";
import { useNow } from "@/hooks/use-now";
import { cx } from "@/lib/cx";
import { BOOST_MAX_BID, BOOST_MIN_BID, BOOST_STEP, kr, market, periods } from "@/lib/data";
import type { Business } from "@/lib/types";
import { BidCountdown } from "./bid-countdown";
import { placeBid } from "./boost-api";
import { sortBids, type BoostState } from "./boost-state";
import styles from "./boost.module.css";
import { ConfirmBidDialog } from "./confirm-bid-dialog";

type BoostProps = {
  /** The owner's business: decides the market (category and city). */
  biz: Business;
  boost: BoostState;
  onBoost: (patch: Partial<BoostState>) => void;
};

const RULES = [
  "En topplacering per kategori och stad. Den märks alltid Sponsrad.",
  "Placeringen gäller sju dagar, måndag 00:00 till söndag 23:59.",
  "Budgivningen stänger söndag kl. 20:00. Högsta behöriga bud vinner.",
  "Minsta bud är 500 kr. Ett nytt bud måste vara minst 50 kr högre än det ledande.",
  "Du betalar ditt bud, plus moms, bara om du vinner.",
  "Organisk ranking, betyg och omdömen påverkas inte.",
];

const parse = (v: string) => parseInt(v.replace(/[^0-9]/g, ""), 10) || 0;

/** Tipsly Boost: the weekly auction for the sponsored top placement. */
export function Boost({ biz, boost, onBoost }: BoostProps) {
  const toast = useToast();
  const now = useNow();
  const ids = useId();
  const p = periods(now);
  const sponsor = market(biz.city, biz.cat).sponsor;
  const marketName = biz.catName + " · " + biz.cityName;
  const phase = boost.phase;

  const minBid = Math.max(BOOST_MIN_BID, (boost.leading || 0) + BOOST_STEP);
  const [input, setInput] = useState(() => String(minBid));
  const [error, setError] = useState("");
  const [focus, setFocus] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<"active" | "past">("active");
  const [bump, setBump] = useState(false);

  const bumpTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(bumpTimer.current), []);
  const bumpLeading = () => {
    setBump(true);
    window.clearTimeout(bumpTimer.current);
    bumpTimer.current = window.setTimeout(() => setBump(false), 500);
  };

  const amount = parse(input);
  const liveError = !error && amount && amount < minBid ? `Budet måste vara minst ${kr(minBid)}.` : "";
  const shownError = error || liveError;

  const validate = () => {
    if (!amount) return "Skriv hur mycket du vill buda.";
    if (amount < minBid) return `Budet måste vara minst ${kr(minBid)}.`;
    if (amount % BOOST_STEP) return "Budet måste gå jämnt upp i 50 kr.";
    if (amount > BOOST_MAX_BID) return "Det högsta budet du kan lägga är 50 000 kr.";
    return "";
  };

  const setAmount = (n: number) => {
    setInput(String(Math.max(0, n)));
    setError("");
  };

  const openConfirm = () => {
    const err = validate();
    if (err) setError(err);
    else setConfirmOpen(true);
  };

  const closeConfirm = useCallback(() => setConfirmOpen(false), []);

  const submit = async () => {
    if (submitting) return;
    const v = amount;
    setSubmitting(true);
    try {
      await placeBid(v);
    } catch {
      setSubmitting(false);
      toast("Budet kunde inte läggas. Försök igen.", "circle-alert");
      return;
    }
    const bids = sortBids([{ who: "Du", amount: v, time: "nyss", mine: true }, ...boost.bids.filter((x) => !x.mine)]);
    onBoost({ phase: "leading", myBid: v, leading: v, bids, outbidBy: "" });
    setSubmitting(false);
    setConfirmOpen(false);
    setAmount(v + BOOST_STEP);
    bumpLeading();
    toast(`Ditt bud på ${kr(v)} leder budgivningen`, "circle-check");
  };

  // Demo only: a competitor outbids the owner.
  const simulate = () => {
    const v = boost.leading + 150;
    const bids = sortBids([
      { who: "Budgivare A", amount: v, time: "nyss", mine: false },
      ...boost.bids.filter((x) => x.who !== "Budgivare A"),
    ]);
    onBoost({ phase: "outbid", leading: v, bids, outbidBy: "Budgivare A" });
    setAmount(v + BOOST_STEP);
    bumpLeading();
  };

  const quick = [
    { label: "Minsta bud " + kr(minBid), n: minBid },
    { label: "+100 kr", n: Math.max(minBid, amount) + 100 },
    { label: "+250 kr", n: Math.max(minBid, amount) + 250 },
  ];

  const history = [
    { week: p.past[0].week, range: p.past[0].range, won: true, bid: 1200, detail: "3 412 visningar som sponsrad" },
    { week: p.past[1].week, range: p.past[1].range, won: false, bid: 1050, detail: "Vinnande bud var " + kr(1300) },
    { week: p.past[2].week, range: p.past[2].range, won: true, bid: 950, detail: "2 980 visningar som sponsrad" },
  ];

  const bidId = ids + "bid";
  const helpId = ids + "bid-help";
  const titleId = ids + "bid-title";

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.intro}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Tipsly Boost</h1>
            <span className={styles.demoChip}>Demo · inga riktiga bud</span>
          </div>
          <p className={styles.lead}>
            Buda på veckans topplacering i din kategori och stad. Det högsta behöriga budet när budgivningen stänger
            vinner platsen i sju dagar.
          </p>
        </div>
        <span className={styles.marketPill}>
          <Icon name="map-pin" size={15} />
          {marketName}
        </span>
      </header>

      <div className={styles.main}>
        <section aria-labelledby={titleId} className={styles.bidCard}>
          <div className={styles.bidHead}>
            <div>
              <div id={titleId} className={styles.eyebrow}>
                Topplacering · vecka {p.next.week}
              </div>
              <div className={styles.range}>{p.next.range}</div>
            </div>
            <span className={styles.openPill}>
              <span className={styles.liveDot} />
              Budgivningen är öppen
            </span>
          </div>

          <BidCountdown />
          <div className={styles.closes}>Budgivningen stänger {p.closesText}.</div>

          <div className={styles.leadingRow}>
            <div>
              <div className={styles.eyebrow}>Ledande bud</div>
              <div className={cx(styles.leadingAmount, bump && styles.leadingBump)}>{kr(boost.leading)}</div>
              <div className={styles.bidCount}>
                {boost.bids.length === 1 ? "1 bud" : boost.bids.length + " bud"} · exkl. moms
              </div>
            </div>
            <div aria-live="polite">
              {phase === "idle" && (
                <span className={cx(styles.phasePill, styles.phaseIdle)}>
                  <Icon name="circle-dashed" size={16} />
                  Du har inte lagt något bud
                </span>
              )}
              {phase === "leading" && (
                <span className={cx(styles.phasePill, styles.phaseLeading)}>
                  <span className={styles.popIcon}>
                    <Icon name="circle-check" size={16} />
                  </span>
                  Du leder budgivningen
                </span>
              )}
              {phase === "outbid" && (
                <span className={cx(styles.phasePill, styles.phaseOutbid)}>
                  <Icon name="circle-alert" size={16} />
                  Du har blivit överbjuden
                </span>
              )}
            </div>
          </div>
          {phase === "outbid" && (
            <p className={cx(styles.phaseNote, styles.noteOutbid)}>
              {(boost.outbidBy || "En konkurrent") +
                ` bjöd ${kr(boost.leading)}. Ditt bud var ${kr(boost.myBid || 0)}. Höj till minst ${kr(minBid)} för att ta tillbaka ledningen.`}
            </p>
          )}
          {phase === "leading" && (
            <p className={cx(styles.phaseNote, styles.noteLeading)}>
              Ditt bud på {kr(boost.myBid || 0)} leder. Du kan höja det fram till att budgivningen stänger.
            </p>
          )}

          <div className={styles.bidForm}>
            <label htmlFor={bidId} className={styles.bidLabel}>
              {phase === "idle" ? "Ditt bud" : "Nytt bud"}
            </label>
            <div className={cx(styles.bidBox, focus && styles.bidBoxFocus, shownError && styles.bidBoxError)}>
              <button
                type="button"
                onClick={() => setAmount(Math.max(minBid, amount - BOOST_STEP))}
                aria-label="Sänk budet med 50 kr"
                className={styles.stepButton}
              >
                <Icon name="minus" size={18} />
              </button>
              <div className={styles.bidValue}>
                <input
                  id={bidId}
                  inputMode="numeric"
                  autoComplete="off"
                  data-keep-size
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value.replace(/[^0-9\s]/g, ""));
                    setError("");
                  }}
                  onFocus={() => setFocus(true)}
                  onBlur={() => setFocus(false)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setAmount(parse(input) + BOOST_STEP);
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setAmount(parse(input) - BOOST_STEP);
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      openConfirm();
                    }
                  }}
                  aria-describedby={helpId}
                  aria-invalid={!!shownError}
                  className={styles.bidInput}
                />
                <span className={styles.bidUnit}>kr</span>
              </div>
              <button
                type="button"
                onClick={() => setAmount((amount || minBid - BOOST_STEP) + BOOST_STEP)}
                aria-label="Höj budet med 50 kr"
                className={styles.stepButton}
              >
                <Icon name="plus" size={18} />
              </button>
            </div>
            <div className={styles.quick}>
              {quick.map((q) => (
                <button key={q.label} type="button" onClick={() => setAmount(q.n)} className={styles.quickChip}>
                  {q.label}
                </button>
              ))}
            </div>
            <div
              id={helpId}
              role={shownError ? "alert" : "note"}
              className={cx(styles.help, shownError && styles.helpError)}
            >
              {shownError || `Minsta bud just nu är ${kr(minBid)}. Höjningar sker i steg om 50 kr.`}
            </div>
          </div>

          <button type="button" onClick={openConfirm} className={styles.cta}>
            <Icon name="gavel" size={18} />
            {phase === "idle" ? "Lägg bud" : "Höj ditt bud"}
          </button>
          <p className={styles.ctaNote}>Du betalar bara om du vinner. Budet är bindande tills budgivningen stänger.</p>

          {phase === "leading" && (
            <div className={styles.demoBox}>
              <span className={styles.demoText}>
                <span className={styles.demoStrong}>Demoläge.</span> Se vad som händer när en konkurrent bjuder högre.
              </span>
              <button type="button" onClick={simulate} className={styles.smallButton}>
                Simulera överbud
              </button>
            </div>
          )}
        </section>

        <div className={styles.side}>
          <section className={styles.sideCard}>
            <div className={styles.eyebrow}>Just nu · vecka {p.current.week}</div>
            <p className={styles.sponsorText}>
              {sponsor.name} har topplaceringen till och med {p.endsText}.
            </p>
            <div className={styles.sponsor}>
              <span
                className={styles.sponsorAvatar}
                style={{ "--tone": sponsor.tone, "--tone-ink": sponsor.toneInk } as CSSProperties}
              >
                {sponsor.initials}
              </span>
              <div className={styles.sponsorInfo}>
                <div className={styles.sponsorName}>{sponsor.name}</div>
                <div className={styles.sponsorMeta}>
                  {sponsor.subName} · {sponsor.hood}
                </div>
              </div>
              <span className={styles.sponsoredChip}>Sponsrad</span>
            </div>
            <p className={styles.sideNote}>Platsen går till vinnaren av budgivningen {p.startsText} kl. 00:00.</p>
          </section>

          <section className={styles.sideCard}>
            <h2 className={styles.sideTitle}>Så fungerar budgivningen</h2>
            <ol className={styles.rules}>
              {RULES.map((text, i) => (
                <li key={i} className={styles.rule}>
                  <span className={styles.ruleNumber} aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.sideCard}>
            <div className={styles.eligibleHead}>
              <h2 className={styles.sideTitle}>Behörighet</h2>
              <span className={styles.eligibleStatus}>Du kan buda</span>
            </div>
            <ul className={styles.eligibility}>
              {[
                "Verifierat organisationsnummer",
                "Komplett profil med bilder och öppettider",
                "Verksam i " + biz.cityName,
                "Inga obetalda fakturor",
              ].map((el) => (
                <li key={el} className={styles.eligibleItem}>
                  <Icon name="circle-check" size={16} className={styles.eligibleIcon} />
                  {el}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Aktiva bud för vecka {p.next.week}</h2>
          <span className={styles.panelNote}>Konkurrenternas namn visas inte · exempeldata</span>
        </div>
        <div role="table" aria-label="Aktiva bud" className={styles.table}>
          <div role="row" className={cx(styles.tableRow, styles.tableHead)}>
            <span role="columnheader">Plats</span>
            <span role="columnheader">Budgivare</span>
            <span role="columnheader" className={cx(styles.right, styles.timeHead)}>
              Lagt
            </span>
            <span role="columnheader" className={cx(styles.right, styles.amountCol)}>
              Bud
            </span>
          </div>
          {boost.bids.map((x, i) => (
            <div
              key={x.who}
              role="row"
              className={cx(styles.tableRow, styles.bidRow, x.mine ? styles.bidMine : i % 2 ? "" : styles.bidStripe)}
            >
              <span role="cell" className={styles.rank}>
                {i + 1}
              </span>
              <span role="cell" className={cx(styles.who, x.mine && styles.whoMine)}>
                {x.who}
                {i === 0 && <span className={styles.leaderChip}>Leder</span>}
              </span>
              <span role="cell" className={cx(styles.right, styles.time)}>
                {x.time}
              </span>
              <span role="cell" className={cx(styles.right, styles.amountCol, styles.amount)}>
                {kr(x.amount)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.boostsHead}>
          <h2 className={styles.panelTitle}>Dina boosts</h2>
          <div role="tablist" aria-label="Dina boosts" className={styles.segment}>
            <button
              type="button"
              role="tab"
              id={ids + "tab-active"}
              aria-selected={tab === "active"}
              aria-controls={ids + "panel"}
              onClick={() => setTab("active")}
              className={cx(styles.segmentButton, tab === "active" && styles.segmentOn)}
            >
              Aktiva
            </button>
            <button
              type="button"
              role="tab"
              id={ids + "tab-past"}
              aria-selected={tab === "past"}
              aria-controls={ids + "panel"}
              onClick={() => setTab("past")}
              className={cx(styles.segmentButton, tab === "past" && styles.segmentOn)}
            >
              Tidigare
            </button>
          </div>
        </div>

        {tab === "active" ? (
          <div
            key="active"
            id={ids + "panel"}
            role="tabpanel"
            aria-labelledby={ids + "tab-active"}
            className={styles.tabPanel}
          >
            {phase !== "idle" ? (
              <div className={styles.activeBoost}>
                <div>
                  <div className={styles.activeTitle}>
                    Vecka {p.next.week} · {p.next.range}
                  </div>
                  <div className={styles.activeMeta}>
                    {marketName} · avgörs {p.closesText}
                  </div>
                </div>
                <div className={styles.activeRight}>
                  <span className={styles.activeBid}>{kr(boost.myBid || 0)}</span>
                  <span className={cx(styles.resultChip, phase === "leading" ? styles.chipWon : styles.chipOutbid)}>
                    {phase === "leading" ? "Leder" : "Överbjuden"}
                  </span>
                </div>
              </div>
            ) : (
              <div className={styles.empty}>
                <Icon name="zap" size={20} className={styles.emptyIcon} />
                <div className={styles.emptyTitle}>Inga aktiva boosts</div>
                <div className={styles.emptyText}>Lägg ett bud för att tävla om nästa veckas topplacering.</div>
              </div>
            )}
          </div>
        ) : (
          <div
            key="past"
            id={ids + "panel"}
            role="tabpanel"
            aria-labelledby={ids + "tab-past"}
            className={cx(styles.tabPanel, styles.history)}
          >
            {history.map((h) => (
              <div key={h.week} className={styles.historyRow}>
                <div>
                  <div className={styles.historyWeek}>Vecka {h.week}</div>
                  <div className={styles.historyRange}>{h.range}</div>
                </div>
                <div>
                  <span className={cx(styles.resultChip, h.won ? styles.chipWon : styles.chipLost)}>
                    {h.won ? "Vann" : "Överbjuden"}
                  </span>
                </div>
                <div className={styles.historyDetail}>
                  Ditt bud {kr(h.bid)} · {h.detail}
                </div>
                <div className={styles.historyCost}>{h.won ? kr(h.bid) : "0 kr"}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {confirmOpen && (
        <ConfirmBidDialog
          amount={amount}
          marketName={marketName}
          periods={p}
          submitting={submitting}
          onCancel={closeConfirm}
          onConfirm={submit}
        />
      )}
    </div>
  );
}
