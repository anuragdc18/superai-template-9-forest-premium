import { Redirect, Route, Switch } from "wouter";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/admin/dashboard";
import LeadsPage from "./pages/admin/leads";
import BrandingPage from "./pages/admin/branding";
import AccountPage from "./pages/admin/account";
import ContactInfoPage from "./pages/admin/contact-info";
import BotPage from "./pages/admin/bot";
import BlogAdminPage from "./pages/admin/blog";
import BlogEditPage from "./pages/admin/blog-edit";
import PackagesAdminPage from "./pages/admin/packages";
import ReviewsAdminPage from "./pages/admin/reviews";
import FaqsAdminPage from "./pages/admin/faqs";
import GalleryAdminPage from "./pages/admin/gallery";
import ServicesAdminPage from "./pages/admin/services";
import SeoAdminPage from "./pages/admin/seo";
import WhatsappAdminPage from "./pages/admin/whatsapp";
import ImagesAdminPage from "./pages/admin/images";
import PreviewPage from "./pages/admin/preview";

/** Admin panel — its own interface, no website header/footer. */
export default function AdminApp() {
  return (
    <Switch>
      <Route path="/admin" component={LoginPage} />
      <Route path="/admin/dashboard" component={DashboardPage} />
      <Route path="/admin/leads" component={LeadsPage} />
      <Route path="/admin/branding" component={BrandingPage} />
      <Route path="/admin/account" component={AccountPage} />
      <Route path="/admin/contact" component={ContactInfoPage} />
      <Route path="/admin/bot" component={BotPage} />
      <Route path="/admin/blog" component={BlogAdminPage} />
      <Route path="/admin/blog/:id" component={BlogEditPage} />
      <Route path="/admin/packages" component={PackagesAdminPage} />
      <Route path="/admin/reviews" component={ReviewsAdminPage} />
      <Route path="/admin/faqs" component={FaqsAdminPage} />
      <Route path="/admin/gallery" component={GalleryAdminPage} />
      <Route path="/admin/services" component={ServicesAdminPage} />
      <Route path="/admin/seo" component={SeoAdminPage} />
      <Route path="/admin/whatsapp" component={WhatsappAdminPage} />
      <Route path="/admin/images" component={ImagesAdminPage} />
      <Route path="/admin/preview" component={PreviewPage} />
      <Route>
        <Redirect to="/admin/dashboard" replace />
      </Route>
    </Switch>
  );
}
