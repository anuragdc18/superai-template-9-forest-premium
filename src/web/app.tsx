import { Redirect, Route, Switch, useLocation } from "wouter";
import Index from "./pages/index";
import CategoryPage from "./pages/category";
import ServicePage from "./pages/service";
import ContactPage from "./pages/contact";
import BlogPage from "./pages/blog";
import PostPage from "./pages/post";
import PackagesPage from "./pages/packages";
import GalleryPage from "./pages/gallery";
import { Provider } from "./components/provider";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { FloatingActions } from "./components/floating-actions";
import { SiteTheme } from "./components/site-theme";
import { Fragment, Suspense, lazy } from "react";
import { DEMO } from "./lib/demo";
import { useContent } from "./queries/content";
import { applyLiveServiceEdits } from "./lib/live-categories";
import { applyLiveImages } from "./lib/site-images";
import { SeoHead } from "./components/seo-head";
import { trackContactClicks } from "./lib/track";

if (!DEMO) trackContactClicks();
// the GitHub Pages copy is only a demo — keep it out of Google
if (DEMO) {
  const m = document.createElement("meta");
  m.name = "robots";
  m.content = "noindex, nofollow";
  document.head.appendChild(m);
}

/** Admin panel — loaded only when someone opens /admin, so visitors download less. */
const AdminApp = lazy(() => import("./admin-app"));

function WebsiteApp() {
  return (
    <div className="flex min-h-screen flex-col pb-14 md:pb-0">
      <SeoHead />
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/services/:cat/:service" component={ServicePage} />
          <Route path="/services/:slug" component={CategoryPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/blog" component={BlogPage} />
          <Route path="/blog/:slug" component={PostPage} />
          <Route path="/packages" component={PackagesPage} />
          <Route path="/gallery" component={GalleryPage} />
          <Route path="/login">
            <Redirect to="/admin" replace />
          </Route>
          <Route component={Index} />
        </Switch>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}

/** Applies Admin → Services edits before the pages render (remounts once when they change). */
function LiveServices({ children, remount }: { children: React.ReactNode; remount: boolean }) {
  const content = useContent();
  applyLiveServiceEdits(content.services);
  applyLiveImages(content.images);
  const json = JSON.stringify(content.services) + JSON.stringify(content.images);
  let h = 5381;
  for (let i = 0; i < json.length; i++) h = ((h << 5) + h + json.charCodeAt(i)) | 0;
  const key = remount && (content.services.length || Object.keys(content.images).length) ? String(h) : "base";
  return <Fragment key={key}>{children}</Fragment>;
}

function App() {
  const [loc] = useLocation();
  const isAdmin = !DEMO && (loc === "/admin" || loc.startsWith("/admin/"));
  return (
    <Provider>
      <SiteTheme />
      <LiveServices remount={!isAdmin}>
        {isAdmin ? (
          <Suspense fallback={<div className="admin-theme min-h-screen bg-[#f5f7fb]" />}>
            <AdminApp />
          </Suspense>
        ) : (
          <WebsiteApp />
        )}
      </LiveServices>
    </Provider>
  );
}

export default App;
