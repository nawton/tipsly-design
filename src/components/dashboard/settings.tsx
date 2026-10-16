"use client";

import { useEffect, useId, useRef } from "react";
import { useToast } from "@/components/providers/app-providers";
import { Icon } from "@/components/ui/icon";
import { useNow } from "@/hooks/use-now";
import { kr, periods } from "@/lib/data";
import { useDashboard, type NotificationKey } from "./dashboard-context";
import { Card, cardTitle, field, PageHeader, Switch, TabSection } from "./dashboard-ui";
import styles from "./settings.module.css";

const NOTIFICATIONS: { key: NotificationKey; label: string; hint: string }[] = [
  { key: "outbid", label: "När någon bjuder över mig", hint: "Mejl direkt när ditt bud inte längre leder." },
  { key: "weekly", label: "Veckorapport", hint: "Besök, sparningar och klick varje måndag." },
  { key: "reviews", label: "Nya omdömen", hint: "Mejl när någon skriver om ditt företag." },
];

/** "Inställningar": account, notifications, payment and closing the account. */
export function Settings() {
  const toast = useToast();
  const now = useNow();
  const id = useId();
  const { account, setAccount, notifications, toggleNotification, confirmDelete, setConfirmDelete } = useDashboard();
  const p = periods(now);

  const invoices = [
    { label: `Tipsly Boost, vecka ${p.past[0].week} (${p.past[0].range})`, amount: kr(1500) + " inkl. moms" },
    { label: `Tipsly Boost, vecka ${p.past[2].week} (${p.past[2].range})`, amount: kr(1187.5) + " inkl. moms" },
  ];

  // Keep keyboard focus on the delete controls as they swap.
  const askRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (confirmDelete ? cancelRef : askRef).current?.focus();
  }, [confirmDelete]);
  const swapDelete = (on: boolean) => {
    moveFocus.current = true;
    setConfirmDelete(on);
  };

  return (
    <TabSection>
      <PageHeader title="Inställningar" lead="Konto, aviseringar och betalning." />

      <Card className={styles.gap16}>
        <h2 className={cardTitle}>Konto</h2>
        <div className={styles.fieldGrid}>
          <div className={field.wrap}>
            <label htmlFor={id + "name"} className={field.label}>
              Namn
            </label>
            <input
              id={id + "name"}
              value={account.name}
              onChange={(e) => setAccount({ name: e.target.value })}
              autoComplete="name"
              className={field.input}
            />
          </div>
          <div className={field.wrap}>
            <label htmlFor={id + "email"} className={field.label}>
              E-post
            </label>
            <input
              id={id + "email"}
              type="email"
              value={account.email}
              onChange={(e) => setAccount({ email: e.target.value })}
              autoComplete="email"
              className={field.input}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => toast("Kontouppgifterna är sparade (demo)", "circle-check")}
          className={styles.darkButton}
        >
          Spara kontouppgifter
        </button>
      </Card>

      <Card>
        <h2 className={`${cardTitle} ${styles.notifTitle}`}>Aviseringar</h2>
        {NOTIFICATIONS.map((n) => (
          <div key={n.key} className={styles.notif}>
            <div>
              <div className={styles.notifLabel}>{n.label}</div>
              <div className={styles.notifHint}>{n.hint}</div>
            </div>
            <Switch on={notifications[n.key]} label={n.label} onToggle={() => toggleNotification(n.key)} />
          </div>
        ))}
      </Card>

      <Card className={styles.gap14}>
        <h2 className={cardTitle}>Betalning</h2>
        <div className={styles.cardOnFile}>
          <span className={styles.cardInfo}>
            <Icon name="credit-card" size={20} />
            <span>
              <span className={styles.cardName}>Kort som slutar på 4242</span>
              <span className={styles.cardHint}>Dras bara när du vinner en budgivning</span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => toast("Demo: betalning är inte inkopplad", "info")}
            className={styles.outlineButton}
          >
            Byt kort
          </button>
        </div>
        <div className={styles.receiptsTitle}>Kvitton</div>
        {invoices.map((iv) => (
          <div key={iv.label} className={styles.receipt}>
            <span>{iv.label}</span>
            <span className={styles.receiptRight}>
              <span className={styles.tabular}>{iv.amount}</span>
              <span className={styles.paid}>Betald</span>
            </span>
          </div>
        ))}
      </Card>

      <Card className={styles.deleteCard}>
        <div className={styles.deleteText}>
          <h2 className={cardTitle}>Avsluta konto</h2>
          <p className={styles.deleteLead}>
            Profilen tas bort från Tipsly. Pågående bud dras tillbaka och debiteras inte.
          </p>
        </div>
        {confirmDelete ? (
          <div className={styles.deleteActions}>
            <button ref={cancelRef} type="button" onClick={() => swapDelete(false)} className={styles.cancelButton}>
              Avbryt
            </button>
            <button
              type="button"
              onClick={() => {
                swapDelete(false);
                toast("Demo: kontot avslutas inte på riktigt", "info");
              }}
              className={styles.dangerButton}
            >
              Ja, avsluta kontot
            </button>
          </div>
        ) : (
          <button ref={askRef} type="button" onClick={() => swapDelete(true)} className={styles.deleteButton}>
            Avsluta konto
          </button>
        )}
      </Card>
    </TabSection>
  );
}
