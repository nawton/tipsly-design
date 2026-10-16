"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { kr } from "@/lib/data";
import type { Periods } from "@/lib/types";
import styles from "./confirm-bid-dialog.module.css";

type ConfirmBidDialogProps = {
  /** The bid in kronor, excl. VAT. */
  amount: number;
  marketName: string;
  periods: Periods;
  submitting: boolean;
  onCancel: () => void;
  /** Called once the terms are accepted. */
  onConfirm: () => void;
};

const VAT = 0.25;
const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/**
 * Modal that confirms a bid. A centered dialog from 640px, a bottom sheet
 * below. Traps focus, locks page scroll and returns focus to the opener.
 * Mount it only while open.
 */
export function ConfirmBidDialog({ amount, marketName, periods: p, submitting, onCancel, onConfirm }: ConfirmBidDialogProps) {
  const ids = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState(false);

  // Focus in, lock scroll; restore both on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const { body, documentElement } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = scrollbar + "px";
    panelRef.current?.focus();
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  // Escape closes (unless the bid is being placed) and Tab stays inside.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (e.key === "Escape" && !submitting) {
        onCancel();
      } else if (e.key === "Tab" && panel) {
        const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
        const active = document.activeElement;
        const first = items[0] ?? panel;
        const last = items[items.length - 1] ?? panel;
        if (!panel.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && (active === first || active === panel)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [submitting, onCancel]);

  // The buttons are disabled while submitting: keep focus in the dialog.
  useEffect(() => {
    const panel = panelRef.current;
    const active = document.activeElement;
    if (submitting && panel && (!panel.contains(active) || active instanceof HTMLButtonElement)) panel.focus();
  }, [submitting]);

  const confirm = () => {
    if (submitting) return;
    if (!agreed) {
      setAgreeError(true);
      return;
    }
    onConfirm();
  };

  const vat = Math.round(amount * VAT);
  const summary = [
    { k: "Placering", v: "Topplacering, " + marketName, strong: false },
    { k: "Period", v: `Vecka ${p.next.week}, ${p.next.range}`, strong: false },
    { k: "Budgivningen stänger", v: p.closesText, strong: false },
    { k: "Ditt bud", v: kr(amount) + " exkl. moms", strong: true },
    { k: "Att betala om du vinner", v: kr(amount + vat) + " inkl. moms", strong: true },
  ];

  return createPortal(
    <div
      className={styles.backdrop}
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) return;
        // Keep the browser from moving focus to <body>, so it can return to the opener.
        e.preventDefault();
        if (!submitting) onCancel();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ids + "title"}
        aria-describedby={ids + "desc"}
        tabIndex={-1}
        className={styles.panel}
      >
        <h2 id={ids + "title"} className={styles.title}>
          Bekräfta ditt bud
        </h2>
        <p id={ids + "desc"} className={styles.lead}>
          Kontrollera uppgifterna innan du lägger budet.
        </p>
        <dl className={styles.summary}>
          {summary.map((s) => (
            <div key={s.k} className={styles.summaryRow}>
              <dt className={styles.term}>{s.k}</dt>
              <dd className={s.strong ? styles.valueStrong : styles.value}>{s.v}</dd>
            </div>
          ))}
        </dl>
        <label className={styles.agree}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              setAgreeError(false);
            }}
            aria-invalid={agreeError}
            aria-describedby={agreeError ? ids + "agree-err" : undefined}
            className={styles.checkbox}
          />
          <span>
            Jag förstår att budet är bindande tills budgivningen stänger och att placeringen märks som Sponsrad.
          </span>
        </label>
        {agreeError && (
          <div id={ids + "agree-err"} role="alert" className={styles.error}>
            Du behöver godkänna villkoren för att lägga budet.
          </div>
        )}
        <div className={styles.actions}>
          <button type="button" onClick={onCancel} disabled={submitting} className={styles.cancel}>
            Avbryt
          </button>
          <button type="button" onClick={confirm} disabled={submitting} className={styles.confirm}>
            {submitting && <span className={styles.spinner} aria-hidden="true" />}
            {submitting ? "Lägger bud…" : "Bekräfta bud"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
