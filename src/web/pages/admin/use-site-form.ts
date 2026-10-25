import { useEffect, useState } from "react";
import { useSaveSite, useSite, type SiteSettings } from "../../queries/site";

/** Local editable copy of site settings + save helpers, shared by the settings pages. */
export function useSiteForm() {
  const site = useSite();
  const save = useSaveSite();
  const [form, setForm] = useState<SiteSettings>(site);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(site);
    setDirty(false);
  }, [site]);

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => {
    setSaved(false);
    setDirty(true);
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = (e?: React.FormEvent, transform?: (f: SiteSettings) => SiteSettings) => {
    e?.preventDefault();
    setError(null);
    const data = transform ? transform(form) : form;
    save.mutate(data, {
      onSuccess: () => {
        setSaved(true);
        setDirty(false);
      },
      onError: (err) => {
        const issues = (err as { data?: { issues?: { message: string }[] } }).data?.issues;
        setError(issues?.[0]?.message || err.message || "Could not save. Please check the fields.");
      },
    });
  };

  return { site, form, setForm, set, submit, saved, error, setError, dirty, pending: save.isPending };
}
