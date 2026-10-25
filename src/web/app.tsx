import { useEffect } from "react";
import { Redirect, Route, Switch, useLocation } from "wouter";
import Index from "./pages/index";
import CategoryPage from "./pages/category";
import ServicePage from "./pages/service";
import ContactPage from "./pages/contact";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/admin/dashboard";
import LeadsPage from "./pages/admin/leads";
import BrandingPage from "./pages/admin/branding";
import AccountPage from "./pages/admin/account";
import ContactInfoPage from "./pages/admin/contact-info";
import BotPage from "./pages/admin/bot";
import { Provider } from "./components/provider";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { FloatingActions } from "./components/floating-actions";
import { SiteTheme } from "./components/site-theme";
import { DEMO } from "./lib/demo";

/** Admin panel — its own interface, no website header/footer. */
function AdminApp() {
  return (
    <Switch>
      <Route path="/admin" component={LoginPage} />
      <Route path="/admin/dashboard" component={DashboardPage} />
      <Route path="/admin/leads" component={LeadsPage} />
      <Route path="/admin/branding" component={BrandingPage} />
      <Route path="/admin/account" component={AccountPage} />
      <Route path="/admin/contact" component={ContactInfoPage} />
      <Route path="/admin/bot" component={BotPage} />
      <Route>
        <Redirect to="/admin/dashboard" replace />
      </Route>
    </Switch>
  );
}

const SITE_TITLE = document.title;

function WebsiteApp() {
  useEffect(() => {
    document.title = SITE_TITLE;
  }, []);
  return (
    <div className="flex min-h-screen flex-col pb-14 md:pb-0">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/services/:cat/:service" component={ServicePage} />
          <Route path="/services/:slug" component={CategoryPage} />
          <Route path="/contact" component={ContactPage} />
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

function App() {
  const [loc] = useLocation();
  const isAdmin = !DEMO && (loc === "/admin" || loc.startsWith("/admin/"));
  return (
    <Provider>
      <SiteTheme />
      {isAdmin ? <AdminApp /> : <WebsiteApp />}
    </Provider>
  );
}

export default App;
