"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useCity, useToast } from "@/components/providers/app-providers";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import { categories, cities } from "@/lib/data";
import { routes } from "@/lib/routes";
import { createBusinessProfile } from "./create-business-profile";
import styles from "./signup-form.module.css";

type Fields = { name: string; cat: string; city: string; email: string; agree: boolean };
type Errors = Partial<Record<"name" | "email" | "agree", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Skriv företagets namn.";
  if (!f.email.trim()) e.email = "Skriv en e-postadress.";
  else if (!EMAIL_RE.test(f.email.trim())) e.email = "E-postadressen ser inte rätt ut.";
  if (!f.agree) e.agree = "Du behöver godkänna villkoren.";
  return e;
}

/** "Lägg till ditt företag": validates on submit, then live after the first attempt. */
export function SignupForm() {
  const { city } = useCity();
  const toast = useToast();
  const [f, setF] = useState<Fields>(() => ({ name: "", cat: "skonhet", city, email: "", agree: false }));
  const [errors, setErrors] = useState<Errors>({});
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const id = useId();

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    const next = { ...f, [key]: value };
    setF(next);
    setErrors(tried ? validate(next) : {});
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const errs = validate(f);
    setTried(true);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await createBusinessProfile({ name: f.name.trim(), cat: f.cat, city: f.city, email: f.email.trim() });
    } catch {
      setBusy(false);
      toast("Något gick fel. Försök igen.", "circle-alert");
      return;
    }
    setBusy(false);
    setDone(true);
    toast("Demo: profilen sparas inte", "info");
  }

  if (done) {
    return (
      <div role="status" className={styles.done}>
        <span className={styles.doneIcon}>
          <Icon name="check" size={26} stroke={2.25} />
        </span>
        <div className={styles.doneTitle}>Klart, {f.name} är tillagt.</div>
        <p className={styles.doneText}>
          Det här är en demo, så inget sparas. Fortsätt till dashboarden för att se hur det ser ut när du redigerar
          profilen och lägger bud.
        </p>
        <Link href={routes.dashboard()} className={styles.doneLink}>
          Öppna dashboarden
          <Icon name="arrow-right" size={16} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={styles.form}>
      <label className={styles.field}>
        <span className={styles.label}>Företagets namn</span>
        <input
          value={f.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Till exempel Salong Linnea"
          autoComplete="organization"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? id + "-name" : undefined}
          className={cx(styles.input, errors.name && styles.invalid)}
        />
        {errors.name && (
          <span id={id + "-name"} role="alert" className={styles.error}>
            {errors.name}
          </span>
        )}
      </label>

      <div className={styles.pair}>
        <label className={styles.field}>
          <span className={styles.label}>Kategori</span>
          <span className={styles.selectWrap}>
            <select value={f.cat} onChange={(e) => set("cat", e.target.value)} className={styles.select}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" size={16} className={styles.selectIcon} />
          </span>
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Stad</span>
          <span className={styles.selectWrap}>
            <select value={f.city} onChange={(e) => set("city", e.target.value)} className={styles.select}>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" size={16} className={styles.selectIcon} />
          </span>
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>E-post</span>
        <input
          type="email"
          value={f.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="namn@foretag.se"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? id + "-email" : undefined}
          className={cx(styles.input, errors.email && styles.invalid)}
        />
        {errors.email && (
          <span id={id + "-email"} role="alert" className={styles.error}>
            {errors.email}
          </span>
        )}
      </label>

      <label className={styles.check}>
        <input
          type="checkbox"
          checked={f.agree}
          onChange={(e) => set("agree", e.target.checked)}
          aria-invalid={!!errors.agree}
          aria-describedby={errors.agree ? id + "-agree" : undefined}
          className={styles.checkbox}
        />
        <span>Jag godkänner Tipslys villkor för företagsprofiler.</span>
      </label>
      {errors.agree && (
        <span id={id + "-agree"} role="alert" className={cx(styles.error, styles.agreeError)}>
          {errors.agree}
        </span>
      )}

      <button type="submit" disabled={busy} aria-busy={busy} className={styles.submit}>
        {busy && <span aria-hidden="true" className={styles.spinner} />}
        {busy ? "Skapar profil…" : "Skapa gratis profil"}
      </button>
    </form>
  );
}
