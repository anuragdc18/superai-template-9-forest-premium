import { asset } from "./demo";
export type Service = {
  name: string;
  text: string;
  days?: string;
  /** optional service-specific landing content (falls back to category defaults) */
  who?: string[];
  includes?: string[];
  docs?: string[];
};
export type Category = {
  slug: string;
  menu: string;
  title: string;
  short: string;
  intro: string;
  image: string;
  /** names shown in the nav dropdown (subset of services) */
  menuItems: string[];
  /** landing-page defaults for every service in this category */
  who: string[];
  includes: string[];
  docs?: string[];
  services: Service[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "registration",
    menu: "Registration",
    title: "Business Registration",
    short: "GST, Company, LLP, MSME, FSSAI and more.",
    intro:
      "Starting a business? We handle the government paperwork for you, fully online. You share documents on WhatsApp and we do the rest.",
    image: asset("/images/cat-registration.jpg"),
    menuItems: [
      "GST Registration",
      "Company Registration (Pvt Ltd)",
      "LLP Registration",
      "MSME / Udyam",
      "Trademark",
      "FSSAI (Food License)",
      "Import Export Code (IEC)",
      "Trade License",
      "GST & Income Tax Filing",
    ],
    who: ["New business owners and startups", "Shops, traders and freelancers", "Anyone who needs a legal business identity"],
    includes: ["Free call to pick the right option", "Document check before filing", "Application filed by our expert", "Regular updates on WhatsApp", "Final certificate sent to you"],
    docs: ["PAN card of owner(s)", "Aadhaar card of owner(s)", "Passport-size photo", "Address proof of business (rent agreement / electricity bill)", "Bank details (cancelled cheque or statement)"],
    services: [
      { name: "GST Registration", text: "Get your GST number so you can bill customers legally.", days: "3–7 days", who: ["Turnover above ₹40 lakh (₹20 lakh for services)", "Selling online on Amazon, Flipkart, etc.", "Selling to other states"], docs: ["PAN card of business / owner", "Aadhaar card of owner", "Photo of owner", "Business address proof", "Bank statement or cancelled cheque"] },
      { name: "Company Registration (Pvt Ltd)", text: "Register a Private Limited company — best for startups that want to grow.", days: "7–10 days", who: ["Startups planning to raise funds", "Businesses with 2 or more owners", "Anyone who wants limited liability"], docs: ["PAN & Aadhaar of all directors", "Photo of all directors", "Office address proof + NOC from owner", "Latest bank statement or utility bill of directors"] },
      { name: "LLP Registration", text: "A partnership with limited risk. Good for small teams and professionals.", days: "10–15 days", who: ["Professionals like CAs, lawyers, consultants", "Small partnerships", "Businesses that want low compliance"], docs: ["PAN & Aadhaar of all partners", "Photo of all partners", "Office address proof + NOC", "Bank statement or utility bill of partners"] },
      { name: "Proprietorship / Firm Registration", text: "The easiest way to start a business on your own.", days: "3–5 days" },
      { name: "MSME / Udyam", text: "Get MSME benefits like easy loans and government schemes.", days: "1–2 days", who: ["Small and medium businesses", "Manufacturers and service providers", "Anyone wanting MSME loan benefits"], docs: ["Aadhaar card of owner", "PAN card", "Basic business details"] },
      { name: "Trademark", text: "Protect your business name and logo so no one can copy it.", days: "2–3 days to file", who: ["Anyone with a business name or logo", "Brands selling online", "Startups that want to protect their identity"], docs: ["Logo (if any)", "Applicant PAN & Aadhaar", "MSME certificate (for lower government fee)", "Signed authorization form (we prepare it)"] },
      { name: "FSSAI (Food License)", text: "Must-have license for any food business, cloud kitchen or shop.", days: "7–15 days", who: ["Restaurants, cafes and cloud kitchens", "Home food businesses", "Food traders and manufacturers"], docs: ["Photo ID of owner", "Passport-size photo", "Business address proof", "List of food items"] },
      { name: "Import Export Code (IEC)", text: "Needed if you want to import or export goods.", days: "2–4 days", who: ["Exporters and importers", "Businesses selling abroad online", "Traders working with foreign suppliers"], docs: ["PAN card", "Aadhaar card", "Business address proof", "Cancelled cheque"] },
      { name: "Trade License", text: "Local license to run your shop or business (incl. GHMC).", days: "7–15 days" },
      { name: "Shop & Establishment", text: "State registration for shops, offices and businesses.", days: "3–7 days" },
      { name: "ISO Certification", text: "Show customers your business follows quality standards.", days: "7–15 days" },
      { name: "GST & Income Tax Filing", text: "We file your GST returns and ITR on time — no penalties.", days: "Monthly / yearly" },
      { name: "TDS, PF & ESIC Filing", text: "Employee-related filings done correctly every month.", days: "Monthly" },
      { name: "Company Yearly Compliance", text: "ROC annual returns, director KYC and reminders for every deadline.", days: "Yearly" },
    ],
  },
  {
    slug: "branding",
    menu: "Branding",
    title: "Logo & Branding",
    short: "Logo, visiting cards and a brand look people remember.",
    intro:
      "Your brand is how customers recognise you. We create a logo and a matching look for your cards, letterheads and profile.",
    image: asset("/images/cat-branding.jpg"),
    menuItems: ["Logo Design", "Business Card", "Letterhead", "Brand Name & Tagline", "Company Profile", "Full Brand Kit"],
    who: ["New businesses that need a look", "Businesses with an old or unclear brand", "Shops, clinics, cafes and startups"],
    includes: ["Short call to understand your business", "2–3 design options to choose from", "Changes until you are happy", "Final files for print and online (PNG, PDF, SVG)"],
    services: [
      { name: "Logo Design", text: "A unique logo with all the files you need for print and online." },
      { name: "Business Card", text: "Visiting cards that look professional and print perfectly." },
      { name: "Letterhead", text: "Letterhead for invoices, quotes and official letters." },
      { name: "Brand Name & Tagline", text: "We help you pick a catchy name and a short tagline." },
      { name: "Company Profile", text: "A neat document that introduces your company to clients." },
      { name: "Full Brand Kit", text: "Logo, colours, fonts and rules — so your brand always looks the same." },
      { name: "Rebranding", text: "Give your old brand a fresh, modern look." },
      { name: "ID Cards & Stamps", text: "Staff ID cards and rubber stamp designs." },
      { name: "T-Shirt & Merchandise", text: "Branded t-shirts, caps and gifts for your team and events." },
      { name: "Email Signature", text: "A professional signature for Gmail and Outlook." },
    ],
  },
  {
    slug: "design",
    menu: "Design",
    title: "Design & Printing",
    short: "Brochures, flyers, packaging and banners, ready to print.",
    intro:
      "Need something designed for print or online? We create ready-to-print files that look great and send the right message.",
    image: asset("/images/cat-design.jpg"),
    menuItems: ["Brochure", "Flyer & Poster", "Packaging", "Flex & Hoarding", "Menu Card", "Certificates & ID Cards"],
    who: ["Businesses printing marketing material", "Shops and restaurants", "Event and exhibition teams"],
    includes: ["Design based on your brand", "Ready-to-print files with correct size", "Changes included", "Help with printing if needed"],
    services: [
      { name: "Brochure", text: "Bi-fold and tri-fold brochures that explain your business clearly." },
      { name: "Flyer & Poster", text: "Eye-catching flyers and posters with one clear message." },
      { name: "Packaging", text: "Product box and label designs that stand out on the shelf." },
      { name: "Flex & Hoarding", text: "Big banners and hoardings that can be read from far away." },
      { name: "Menu Card", text: "Easy-to-read menus for restaurants, cafes and cloud kitchens." },
      { name: "Certificates & ID Cards", text: "Certificates, awards and ID cards in your brand style." },
      { name: "Catalogue", text: "Product catalogues that are easy to browse." },
      { name: "Presentation (PPT)", text: "Professional slides for pitches and meetings." },
      { name: "Social Media Post Design", text: "Ready-made post designs for Instagram and Facebook." },
      { name: "YouTube Thumbnail", text: "Thumbnails that get more clicks." },
      { name: "Newspaper Ad", text: "Print ads made to the newspaper's size rules." },
    ],
  },
  {
    slug: "social-media",
    menu: "Social Media",
    title: "Social Media",
    short: "We post, manage and grow your Instagram and Facebook.",
    intro:
      "No time for social media? We plan, design and post for you every month — and run ads that bring real enquiries.",
    image: asset("/images/cat-social.jpg"),
    menuItems: ["Instagram & Facebook Handling", "Monthly Posts", "Reels Planning", "Paid Ads (Boosting)", "Promo Videos"],
    who: ["Businesses with no time for social media", "Shops and brands that want more enquiries", "Anyone starting on Instagram or Facebook"],
    includes: ["Monthly plan shared in advance", "Designed posts and captions", "Posting on time", "Simple monthly report"],
    services: [
      { name: "Instagram & Facebook Handling", text: "We run your pages — posting, replying and monthly reports." },
      { name: "Monthly Posts", text: "A full month of posts planned and approved by you in advance." },
      { name: "Reels Planning", text: "Reel ideas with hooks, scripts and music suggestions." },
      { name: "Paid Ads (Boosting)", text: "Ads that reach the right people in your city or across India." },
      { name: "Promo Videos", text: "Short videos for reels, stories and WhatsApp status." },
      { name: "Captions & Hashtags", text: "Captions written in your style, with the right hashtags." },
      { name: "Profile Setup", text: "Cover photos, bio and highlights set up properly." },
    ],
  },
  {
    slug: "website",
    menu: "Website",
    title: "Website Development",
    short: "Business websites and online stores that work on mobile.",
    intro:
      "Get found on Google and take orders online. We build fast websites that look great on every phone — and keep them running.",
    image: asset("/images/cat-website.jpg"),
    menuItems: ["Business Website", "Online Store", "Landing Page", "Website Redesign", "Domain & Hosting", "Website Maintenance"],
    who: ["Businesses without a website", "Businesses with an old or slow website", "Shops that want to sell online"],
    includes: ["Mobile-friendly design", "Domain, hosting and SSL setup", "Contact form and WhatsApp button", "Basic Google setup (SEO)", "1 month free support"],
    services: [
      { name: "Business Website", text: "A professional website for your business, ready in 2–3 weeks." },
      { name: "Online Store", text: "Sell online with cart, UPI/card payments and order tracking." },
      { name: "Landing Page", text: "One page made for one offer or ad campaign." },
      { name: "WordPress Website", text: "Easy-to-edit WordPress site you can update yourself." },
      { name: "Website Redesign", text: "Make your old website modern, fast and mobile-friendly." },
      { name: "Domain & Hosting", text: "Your .com or .in domain, hosting and SSL set up in your name." },
      { name: "Payment Gateway", text: "Accept UPI, cards and net banking on your website." },
      { name: "Google Ranking (SEO)", text: "Basic SEO so customers can find you on Google." },
      { name: "Website Maintenance", text: "Updates, backups and small changes every month." },
      { name: "Speed Improvement", text: "Make your slow website load fast." },
    ],
  },
  {
    slug: "ai-tools",
    menu: "AI Tools",
    title: "AI & Automation",
    short: "WhatsApp replies and chatbots that work 24×7.",
    intro:
      "Let smart tools handle the repeat work. Customers get instant replies, and you never miss an enquiry — even at night.",
    image: asset("/images/cat-ai.jpg"),
    menuItems: ["WhatsApp Auto-Reply", "Website Chatbot", "Lead Follow-up Automation", "Appointment Booking Bot", "AI Training for Staff"],
    who: ["Businesses getting many repeat questions", "Teams that miss enquiries after hours", "Owners who want to save time"],
    includes: ["Setup on your WhatsApp or website", "Trained on your business details", "Testing before going live", "Simple training for your team"],
    services: [
      { name: "WhatsApp Auto-Reply", text: "Instant replies to customer questions on WhatsApp Business." },
      { name: "Website Chatbot", text: "A chatbot on your website that answers questions 24×7." },
      { name: "Lead Follow-up Automation", text: "Automatic follow-up messages so no enquiry goes cold." },
      { name: "Appointment Booking Bot", text: "Customers book a time slot themselves — with reminders." },
      { name: "Google Review Replies", text: "Polite, quick replies to your Google reviews." },
      { name: "Google Sheets & CRM Automation", text: "Data that fills itself in — no more manual typing." },
      { name: "Custom ChatGPT for Business", text: "An AI assistant trained on your business information." },
      { name: "AI Training for Staff", text: "Simple hands-on training so your team can use AI daily." },
    ],
  },
  {
    slug: "microsoft-certifications",
    menu: "Microsoft Certifications",
    title: "Microsoft Certifications",
    short: "Fundamentals training for Azure, AI, Copilot, Microsoft 365, Power Platform and Security.",
    intro:
      "Get Microsoft certified with simple, guided training. We teach you the topics, give you practice tests and help you book your exam.",
    image: asset("/images/cat-microsoft.jpg"),
    menuItems: [
      "AB-900: Copilot & Agent Administration Fundamentals",
      "AI-901: Azure AI Fundamentals",
      "AZ-900: Azure Fundamentals",
      "DP-900: Azure Data Fundamentals",
      "PL-900: Power Platform Fundamentals",
      "MS-900: Microsoft 365 Fundamentals",
      "SC-900: Security, Compliance & Identity Fundamentals",
    ],
    who: ["Students and freshers who want a job-ready certificate", "Working professionals moving into cloud or AI", "Companies training their teams on Microsoft tools"],
    includes: ["Live online classes by a certified trainer", "Notes and Microsoft Learn study path", "Practice tests like the real exam", "Help booking your exam on Pearson VUE", "Doubt-clearing on WhatsApp"],
    docs: ["Any photo ID (Aadhaar, PAN or passport) for the exam", "Email ID to create your Microsoft Learn profile", "Laptop with internet for online classes"],
    services: [
      { name: "AB-900: Copilot & Agent Administration Fundamentals", text: "Learn to set up and manage Microsoft 365 Copilot and AI agents. Great for teams using Copilot at work.", who: ["IT admins working with Microsoft 365", "Teams rolling out Copilot at work"] },
      { name: "AI-901: Azure AI Fundamentals", text: "The new AI fundamentals exam (AI-900 is now AI-901). Learn AI basics and build simple AI apps and agents on Azure.", who: ["Beginners starting in AI", "Students and freshers", "Anyone who planned to take AI-900"] },
      { name: "AZ-900: Azure Fundamentals", text: "Your first step into cloud. Learn what Azure is, its main services and pricing.", who: ["Beginners new to cloud", "Sales and non-technical staff", "Anyone planning Azure admin or developer exams"] },
      { name: "DP-900: Azure Data Fundamentals", text: "Learn the basics of data, databases and data analysis on Azure." },
      { name: "PL-900: Power Platform Fundamentals", text: "Build simple apps, automations and reports with Power Apps, Power Automate and Power BI — no coding needed." },
      { name: "MS-900: Microsoft 365 Fundamentals", text: "Learn the basics of Microsoft 365 — Outlook, Teams, SharePoint, OneDrive, security and licensing." },
      { name: "SC-900: Security, Compliance & Identity Fundamentals", text: "Learn the basics of cyber security, identity and data protection with Microsoft tools." },
    ],
  },
];

export const ALL_SERVICE_NAMES = CATEGORIES.flatMap((c) => c.services.map((s) => s.name));

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const SLIDES = [
  {
    image: asset("/images/hero-registration.jpg"),
    tag: "Business Registration",
    title: "Start Your Business the Right Way",
    text: "GST, Company, LLP, MSME and Trademark registration. We handle the paperwork, so you can focus on your business.",
    cta: "Get Free Consultation",
    link: "/services/registration",
    linkText: "See Registration Services",
  },
  {
    image: asset("/images/hero-microsoft.jpg"),
    tag: "Microsoft Certifications",
    title: "Get Microsoft Certified",
    text: "Simple, guided training for Microsoft Fundamentals exams — with practice tests and exam booking help.",
    cta: "",
    link: "/services/microsoft-certifications",
    linkText: "Browse All Exams",
    badges: true,
  },
  {
    image: asset("/images/hero-branding.jpg"),
    tag: "Logo & Branding",
    title: "Look Professional From Day One",
    text: "Logo, business cards, brochures and packaging that make customers trust you.",
    cta: "Get Your Logo Designed",
    link: "/services/branding",
    linkText: "See Branding Services",
  },
  {
    image: asset("/images/hero-website.jpg"),
    tag: "Website & Social Media",
    title: "Get More Customers Online",
    text: "A website that works on every phone, plus social media pages that bring in enquiries.",
    cta: "Build My Website",
    link: "/services/website",
    linkText: "See Website Services",
  },
];

export const POPULAR = [
  { name: "GST Registration", cat: "registration", days: "3–7 days" },
  { name: "Company Registration (Pvt Ltd)", cat: "registration", days: "7–10 days" },
  { name: "Trademark", cat: "registration", days: "File in 2–3 days" },
  { name: "MSME / Udyam", cat: "registration", days: "1–2 days" },
  { name: "Logo Design", cat: "branding", days: "3–5 days" },
  { name: "Business Website", cat: "website", days: "2–3 weeks" },
  { name: "Instagram & Facebook Handling", cat: "social-media", days: "Monthly plan" },
  { name: "WhatsApp Auto-Reply", cat: "ai-tools", days: "Ready in 1 week" },
];

export const findService = (catSlug: string, serviceSlug: string) => {
  const cat = CATEGORIES.find((c) => c.slug === catSlug);
  const service = cat?.services.find((x) => slugify(x.name) === serviceSlug);
  return { cat, service };
};

export const serviceUrl = (catSlug: string, name: string) => `/services/${catSlug}/${slugify(name)}`;

export const waLink = (number: string, text = "Hi, I need help with your services") =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
