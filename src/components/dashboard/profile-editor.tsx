"use client";

import Image from "next/image";
import { useId, useState, type ChangeEvent, type CSSProperties, type DragEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import { categories, catById, DAYS_LONG } from "@/lib/data";
import {
  DESC_MAX,
  formCategory,
  MAX_IMAGES,
  useDashboard,
  type HoursRow,
  type ServiceRow,
} from "./dashboard-context";
import { Card, cardTitle, field, PageHeader, Switch, TabSection } from "./dashboard-ui";
import styles from "./profile-editor.module.css";

/** "Företagsprofil": everything visitors see on the public profile, with a save bar. */
export function ProfileEditor() {
  return (
    <TabSection>
      <PageHeader title="Företagsprofil" lead="Det här visas för besökare på din profil och i sökresultaten." />
      <BasicsCard />
      <MediaCard />
      <CategoryCard />
      <HoursCard />
      <SaveBar />
    </TabSection>
  );
}

/* ------------------------------------------------------------------ */
/* Grunduppgifter                                                      */
/* ------------------------------------------------------------------ */

function BasicsCard() {
  const { form, errors, updateForm } = useDashboard();
  const id = useId();
  const descCount = form.desc.length;

  return (
    <Card className={styles.gap16}>
      <h2 className={cardTitle}>Grunduppgifter</h2>

      <div className={field.wrap}>
        <label htmlFor={id + "name"} className={field.label}>
          Företagets namn
        </label>
        <input
          id={id + "name"}
          value={form.name}
          onChange={(e) => updateForm(() => ({ name: e.target.value }))}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? id + "name-err" : undefined}
          className={cx(field.input, errors.name && field.invalid)}
        />
        {errors.name && (
          <span id={id + "name-err"} role="alert" className={field.error}>
            {errors.name}
          </span>
        )}
      </div>

      <div className={field.wrap}>
        <div className={styles.labelRow}>
          <label htmlFor={id + "desc"}>Beskrivning</label>
          <span
            id={id + "desc-count"}
            className={cx(styles.counter, descCount > DESC_MAX && styles.counterOver)}
          >
            {`${descCount} / ${DESC_MAX}`}
          </span>
        </div>
        <textarea
          id={id + "desc"}
          value={form.desc}
          onChange={(e) => updateForm(() => ({ desc: e.target.value }))}
          rows={4}
          aria-invalid={!!errors.desc}
          aria-describedby={id + "desc-count" + (errors.desc ? " " + id + "desc-err" : "")}
          className={cx(field.input, styles.textarea, errors.desc && field.invalid)}
        />
        {errors.desc && (
          <span id={id + "desc-err"} role="alert" className={field.error}>
            {errors.desc}
          </span>
        )}
      </div>

      <div className={styles.fieldGrid}>
        <div className={field.wrap}>
          <label htmlFor={id + "address"} className={field.label}>
            Adress
          </label>
          <input
            id={id + "address"}
            value={form.address}
            onChange={(e) => updateForm(() => ({ address: e.target.value }))}
            autoComplete="street-address"
            className={field.input}
          />
        </div>
        <div className={field.wrap}>
          <label htmlFor={id + "phone"} className={field.label}>
            Telefon
          </label>
          <input
            id={id + "phone"}
            type="tel"
            value={form.phone}
            onChange={(e) => updateForm(() => ({ phone: e.target.value }))}
            autoComplete="tel"
            className={field.input}
          />
        </div>
        <div className={field.wrap}>
          <label htmlFor={id + "web"} className={field.label}>
            Webbplats
          </label>
          <input
            id={id + "web"}
            value={form.web}
            onChange={(e) => updateForm(() => ({ web: e.target.value }))}
            inputMode="url"
            autoComplete="url"
            aria-invalid={!!errors.web}
            aria-describedby={errors.web ? id + "web-err" : undefined}
            className={cx(field.input, errors.web && field.invalid)}
          />
          {errors.web && (
            <span id={id + "web-err"} role="alert" className={field.error}>
              {errors.web}
            </span>
          )}
        </div>
        <div className={field.wrap}>
          <label htmlFor={id + "insta"} className={field.label}>
            Instagram
          </label>
          <input
            id={id + "insta"}
            value={form.insta}
            onChange={(e) => updateForm(() => ({ insta: e.target.value }))}
            className={field.input}
          />
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Bilder och logotyp                                                  */
/* ------------------------------------------------------------------ */

function MediaCard() {
  const { biz, logo, setLogoFile, removeLogo, gallery, addImages, removeImage, uploadError } = useDashboard();
  const [dragOver, setDragOver] = useState(false);

  const onLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) setLogoFile(file);
  };
  const onGallery = (e: ChangeEvent<HTMLInputElement>) => {
    addImages(e.target.files);
    e.target.value = "";
  };
  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addImages(e.dataTransfer?.files);
  };

  return (
    <Card className={styles.gap18}>
      <h2 className={cardTitle}>Bilder och logotyp</h2>

      <div className={styles.logoRow}>
        {logo ? (
          <Image src={logo} alt="Logotyp" width={72} height={72} unoptimized className={styles.logo} />
        ) : (
          <span className={styles.logoEmpty} style={{ "--tone-ink": biz.toneInk } as CSSProperties}>
            {biz.initials}
          </span>
        )}
        <div className={styles.logoText}>
          <div className={styles.logoTitle}>Logotyp</div>
          <div className={styles.logoHint}>PNG eller JPG, minst 400 × 400 px.</div>
        </div>
        <div className={styles.logoActions}>
          <label className={styles.uploadButton}>
            <Icon name="upload" size={15} />
            Ladda upp
            <input type="file" accept="image/*" onChange={onLogo} className={styles.fileInput} />
          </label>
          {logo && (
            <button type="button" onClick={removeLogo} className={styles.removeLogo}>
              Ta bort
            </button>
          )}
        </div>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cx(styles.dropzone, dragOver && styles.dropzoneActive)}
      >
        {gallery.map((g) => (
          <div key={g.id} className={styles.photo}>
            <Image src={g.url} alt={g.name} fill unoptimized sizes="200px" className={styles.photoImg} />
            <button
              type="button"
              onClick={() => removeImage(g.id)}
              aria-label="Ta bort bilden"
              className={styles.photoRemove}
            >
              <Icon name="x" size={14} stroke={2} />
            </button>
          </div>
        ))}
        <label className={styles.addPhotos}>
          <Icon name="image-plus" size={22} />
          <span className={styles.addTitle}>Lägg till bilder</span>
          <span className={styles.addHint}>eller dra in dem här</span>
          <input type="file" accept="image/*" multiple onChange={onGallery} className={styles.fileInput} />
        </label>
      </div>

      <div className={styles.galleryFoot}>
        <span>
          {gallery.length}
          {` av ${MAX_IMAGES} bilder · max 8 MB per bild`}
        </span>
        {uploadError && (
          <span role="alert" className={styles.uploadError}>
            {uploadError}
          </span>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Kategori och tjänster                                               */
/* ------------------------------------------------------------------ */

function CategoryCard() {
  const { form, updateForm, newServiceId } = useDashboard();
  const id = useId();
  const cat = formCategory(form);

  const updService = (sid: string, key: keyof Omit<ServiceRow, "id">, value: string) =>
    updateForm((f) => ({ services: f.services.map((s) => (s.id === sid ? { ...s, [key]: value } : s)) }));

  const toggleSub = (subId: string) =>
    updateForm((f) => {
      const subs = { ...f.subs };
      if (subs[subId]) delete subs[subId];
      else subs[subId] = true;
      return { subs };
    });

  return (
    <Card className={styles.gap18}>
      <h2 className={cardTitle}>Kategori och tjänster</h2>

      <div className={cx(field.wrap, styles.catField)}>
        <label htmlFor={id + "cat"} className={field.label}>
          Huvudkategori
        </label>
        <span className={styles.selectWrap}>
          <select
            id={id + "cat"}
            value={form.cat}
            onChange={(e) => {
              const next = catById[e.target.value];
              if (next) updateForm(() => ({ cat: next.id, subs: { [next.subs[0].id]: true } }));
            }}
            className={cx(field.input, styles.select)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Icon name="chevron-down" size={16} className={styles.selectIcon} />
        </span>
      </div>

      <div role="group" aria-labelledby={id + "subs"}>
        <div id={id + "subs"} className={styles.groupLabel}>
          Underkategorier
        </div>
        <div className={styles.chips}>
          {cat.subs.map((x) => {
            const on = !!form.subs[x.id];
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => toggleSub(x.id)}
                aria-pressed={on}
                className={cx(styles.chip, on && styles.chipOn)}
              >
                <Icon name={on ? "check" : "plus"} size={14} stroke={2} />
                {x.name}
              </button>
            );
          })}
        </div>
      </div>

      <div role="group" aria-labelledby={id + "services"}>
        <div id={id + "services"} className={styles.groupLabel}>
          Tjänster och priser
        </div>
        <div className={styles.services}>
          {form.services.map((sv) => (
            <div key={sv.id} className={styles.serviceRow}>
              <input
                value={sv.name}
                onChange={(e) => updService(sv.id, "name", e.target.value)}
                placeholder="Tjänst"
                aria-label="Tjänst"
                className={cx(styles.serviceInput, styles.serviceName)}
              />
              <input
                value={sv.price}
                onChange={(e) => updService(sv.id, "price", e.target.value)}
                placeholder="Pris"
                aria-label="Pris"
                className={styles.serviceInput}
              />
              <input
                value={sv.detail}
                onChange={(e) => updService(sv.id, "detail", e.target.value)}
                placeholder="Tid eller info"
                aria-label="Tid eller info"
                className={styles.serviceInput}
              />
              <button
                type="button"
                onClick={() => updateForm((f) => ({ services: f.services.filter((x) => x.id !== sv.id) }))}
                aria-label="Ta bort tjänsten"
                className={styles.serviceRemove}
              >
                <Icon name="trash-2" size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const sid = newServiceId();
            updateForm((f) => ({ services: f.services.concat({ id: sid, name: "", price: "", detail: "" }) }));
          }}
          className={styles.addService}
        >
          <Icon name="plus" size={16} />
          Lägg till tjänst
        </button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Öppettider                                                          */
/* ------------------------------------------------------------------ */

function HoursCard() {
  const { form, updateForm } = useDashboard();
  const updHour = <K extends keyof HoursRow>(idx: number, key: K, value: HoursRow[K]) =>
    updateForm((f) => ({ hours: f.hours.map((h) => (h.idx === idx ? { ...h, [key]: value } : h)) }));

  return (
    <Card className={styles.gap6}>
      <h2 className={cx(cardTitle, styles.hoursTitle)}>Öppettider</h2>
      {form.hours.map((h) => {
        const day = DAYS_LONG[h.idx];
        return (
          <div key={h.idx} className={styles.hoursRow}>
            <span className={styles.day}>{day}</span>
            <Switch on={h.open} label={"Öppet " + day.toLowerCase()} onToggle={() => updHour(h.idx, "open", !h.open)} />
            {h.open ? (
              <span className={styles.times}>
                <input
                  type="time"
                  value={h.from}
                  onChange={(e) => updHour(h.idx, "from", e.target.value)}
                  aria-label={day + " öppnar"}
                  className={styles.time}
                />
                <span className={styles.dash}>–</span>
                <input
                  type="time"
                  value={h.to}
                  onChange={(e) => updHour(h.idx, "to", e.target.value)}
                  aria-label={day + " stänger"}
                  className={styles.time}
                />
              </span>
            ) : (
              <span className={styles.closed}>Stängt</span>
            )}
          </div>
        );
      })}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Save bar                                                            */
/* ------------------------------------------------------------------ */

function SaveBar() {
  const { dirty, errors, saving, discardForm, saveForm } = useDashboard();
  const nErr = Object.keys(errors).length;

  return (
    <div className={cx(styles.saveDock, dirty && styles.saveDockOpen)} inert={!dirty}>
      <div className={styles.saveClip}>
        <div className={styles.saveBar}>
          <span className={styles.saveText}>
            {nErr ? `Rätta ${nErr === 1 ? "felet" : "felen"} ovan innan du sparar` : "Du har osparade ändringar"}
          </span>
          <div className={styles.saveActions}>
            <button type="button" onClick={discardForm} className={styles.discard}>
              Ångra
            </button>
            <button type="button" onClick={saveForm} className={styles.save}>
              {saving && <span className={styles.spinner} aria-hidden="true" />}
              {saving ? "Sparar…" : "Spara ändringar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
