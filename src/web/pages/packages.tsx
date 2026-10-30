import { useEffect } from "react";
import { useContent } from "../queries/content";
import { PackageCards, PageBanner } from "../components/content-ui";
import { CtaBand } from "./index";

export default function PackagesPage() {
  const content = useContent();
  const s = content.packagesSection;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <PageBanner title={s.title || "Packages & Pricing"} text={s.subtitle} crumbs={[{ label: "Home", to: "/" }, { label: s.title || "Packages" }]} />
      <section className="py-14 sm:py-20">
        <div className="container-x">
          {content.packages.length ? <PackageCards packages={content.packages} /> : <p className="py-16 text-center text-[16px]">Packages will be added soon. Please contact us for a quote.</p>}
          {s.note && <p className="mt-8 text-center text-[14px] text-slate-500">{s.note}</p>}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
