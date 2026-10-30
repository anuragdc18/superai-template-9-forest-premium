import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { uploadImage } from "../../queries/content";

/** Shared small building blocks for the admin content pages. */

export const input = "field";

export function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 items-center gap-1.5 rounded-md border border-dashed border-blue-300 px-4 text-[13.5px] font-semibold text-blue-600 hover:bg-blue-50"
    >
      <Plus className="h-4 w-4" /> {children}
    </button>
  );
}

export function IconButton({ onClick, label, danger, children, disabled }: { onClick: () => void; label: string; danger?: boolean; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-30 ${
        danger ? "hover:border-red-200 hover:bg-red-50 hover:text-red-600" : "hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
}

/** Up / down / delete buttons for a row in a list. */
export function RowTools({ i, count, onMove, onRemove, label }: { i: number; count: number; onMove: (from: number, to: number) => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex gap-1.5">
      <IconButton label="Move up" onClick={() => onMove(i, i - 1)} disabled={i === 0}>
        <ArrowUp className="h-4 w-4" />
      </IconButton>
      <IconButton label="Move down" onClick={() => onMove(i, i + 1)} disabled={i === count - 1}>
        <ArrowDown className="h-4 w-4" />
      </IconButton>
      <IconButton label={`Delete ${label}`} danger onClick={() => confirm(`Delete this ${label}?`) && onRemove()}>
        <Trash2 className="h-4 w-4" />
      </IconButton>
    </div>
  );
}

export const move = <T,>(list: T[], from: number, to: number) => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
};

/** On/off switch with a label. */
export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-500/20" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
      <span>
        <span className="block text-[14px] font-semibold text-slate-700">{label}</span>
        {hint && <span className="block text-[12.5px] text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}

/** Upload / replace / remove one image. Images are shrunk in the browser before upload. */
export function ImagePicker({ value, onChange, label = "Image", aspect = "aspect-[16/9]", hint }: { value: string; onChange: (url: string) => void; label?: string; aspect?: string; hint?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const pick = async (file?: File) => {
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed. Is the database connected?");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };
  return (
    <div className="grid gap-1.5">
      <span className="text-[13.5px] font-semibold text-slate-700">{label}</span>
      <div
        className={`relative overflow-hidden rounded-md border-2 border-dashed border-slate-200 bg-slate-50 ${aspect}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files[0]);
        }}
      >
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <div className="absolute right-2 top-2 flex gap-1.5">
              <button type="button" onClick={() => ref.current?.click()} className="rounded-md bg-white/95 px-3 py-1.5 text-[12.5px] font-semibold text-slate-700 shadow hover:bg-white">
                Change
              </button>
              <button type="button" onClick={() => onChange("")} aria-label="Remove image" className="grid h-8 w-8 place-items-center rounded-md bg-white/95 text-red-600 shadow hover:bg-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => ref.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-blue-600">
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-7 w-7" />}
            <span className="text-[13px] font-semibold">{busy ? "Uploading…" : "Click or drop an image"}</span>
            <span className="text-[12px]">JPG, PNG or WebP</span>
          </button>
        )}
        {busy && value && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {hint && <span className="text-[12.5px] text-slate-500">{hint}</span>}
      {err && <span className="text-[12.5px] font-medium text-red-600">{err}</span>}
    </div>
  );
}

/** Save button + status line for list pages. */
export function SaveRow({ pending, saved, error, dirty, onSave, label = "Save Changes" }: { pending: boolean; saved: boolean; error: string | null; dirty: boolean; onSave: () => void; label?: string }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {error && <p className="mr-auto text-[14px] font-medium text-red-600">{error}</p>}
      {!error && saved && !dirty && <p className="mr-auto text-[14px] font-medium text-green-600">Saved. Your website is updated.</p>}
      {!error && dirty && <p className="mr-auto text-[14px] text-slate-500">You have unsaved changes.</p>}
      <button
        type="button"
        onClick={onSave}
        disabled={pending}
        className="flex h-11 items-center gap-2 rounded-md bg-blue-600 px-6 text-[14px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.7)] hover:bg-blue-700 disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} {label}
      </button>
    </div>
  );
}

/** Turn an oRPC error into a friendly line. */
export function errorText(err: unknown) {
  const e = err as { data?: { issues?: { message: string; path?: (string | number)[] }[] }; message?: string };
  const issue = e?.data?.issues?.[0];
  if (issue) return issue.message;
  return e?.message || "Could not save. Please check the fields.";
}

/** Local editable copy of one content section, with save state. */
export function useEditable<T>(source: T | undefined, saveFn: (v: T) => Promise<unknown>) {
  const [value, setValue] = useState<T | undefined>(source);
  // compare by content, so a freshly built object with the same data doesn't reset the form
  const sourceKey = source === undefined ? "" : JSON.stringify(source);
  const [loadedFrom, setLoadedFrom] = useState(sourceKey);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (sourceKey !== loadedFrom && !dirty) {
    setLoadedFrom(sourceKey);
    setValue(source);
  }
  const update = (v: T | ((old: T) => T)) => {
    setValue((old) => (typeof v === "function" ? (v as (o: T) => T)(old as T) : v));
    setDirty(true);
    setSaved(false);
  };
  const save = async () => {
    if (value === undefined) return;
    setError(null);
    setPending(true);
    try {
      await saveFn(value);
      setDirty(false);
      setSaved(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  };
  return { value, update, save, dirty, saved, pending, error };
}
