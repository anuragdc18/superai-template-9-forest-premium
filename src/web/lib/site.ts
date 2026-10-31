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
    menuItems: ["GST Registration", "Private Limited Registration", "LLP Registration", "Udyam / MSME Registration", "Trademark Registration", "FSSAI Registration", "GST Filings", "Income Tax Filing"],
    who: ["New business owners and startups", "Shops, traders and freelancers", "Anyone who needs a legal business identity"],
    includes: ["Free call to pick the right option", "Document check before filing", "Application filed by our expert", "Regular updates on WhatsApp", "Final certificate sent to you"],
    docs: ["PAN card of owner(s)", "Aadhaar card of owner(s)", "Passport-size photo", "Address proof of business (rent agreement / electricity bill)", "Bank details (cancelled cheque or statement)"],
    services: [
      { name: "GST Registration", text: "Get your GST number so you can bill customers legally.", days: "3–7 days", who: ["Turnover above the GST limit", "Selling online on Amazon, Flipkart, etc.", "Selling to other states"], docs: ["PAN card of business / owner", "Aadhaar card of owner", "Photo of owner", "Business address proof", "Bank statement or cancelled cheque"] },
      { name: "APEDA Registration", text: "Registration needed to export agricultural and processed food products.", days: "5–10 days", docs: ["IEC certificate", "PAN & Aadhaar", "Business address proof", "Cancelled cheque"] },
      { name: "Firm Registration", text: "Register a proprietorship or partnership firm — the simplest way to start.", days: "3–7 days" },
      { name: "LLP Registration", text: "A partnership with limited risk — good for small teams and professionals.", days: "10–15 days", who: ["Professionals and consultants", "Small partnerships", "Businesses that want low compliance"], docs: ["PAN & Aadhaar of all partners", "Photo of all partners", "Office address proof + NOC", "Bank statement or utility bill of partners"] },
      { name: "Society Registration", text: "Register a society for charitable, cultural, educational or welfare work.", days: "15–30 days" },
      { name: "Private Limited Registration", text: "Register a Private Limited company — best for startups that want to grow.", days: "7–10 days", who: ["Startups planning to raise funds", "Businesses with 2 or more owners", "Anyone who wants limited liability"], docs: ["PAN & Aadhaar of all directors", "Photo of all directors", "Office address proof + NOC from owner", "Latest bank statement or utility bill of directors"] },
      { name: "Public Limited Registration", text: "Register a Public Limited company for larger businesses with many shareholders.", days: "15–20 days" },
      { name: "GHMC Trade License", text: "Trade licence from GHMC to run your business legally in Hyderabad.", days: "7–15 days" },
      { name: "Labour License", text: "Labour licence for businesses and contractors who employ workers.", days: "7–15 days" },
      { name: "Trade License", text: "Local trade licence from your municipal body to run your shop or business.", days: "7–15 days" },
      { name: "FSSAI Registration", text: "Must-have food licence for restaurants, cloud kitchens, home food and food traders.", days: "7–15 days", who: ["Restaurants, cafes and cloud kitchens", "Home food businesses", "Food traders and manufacturers"], docs: ["Photo ID of owner", "Passport-size photo", "Business address proof", "List of food items"] },
      { name: "Udyam / MSME Registration", text: "Get MSME recognition for easier loans and government scheme benefits.", days: "1–2 days", who: ["Small and medium businesses", "Manufacturers and service providers", "Anyone wanting MSME loan benefits"], docs: ["Aadhaar card of owner", "PAN card", "Basic business details"] },
      { name: "Trademark Registration", text: "Protect your business name and logo so no one else can use them.", days: "2–3 days to file", who: ["Anyone with a business name or logo", "Brands selling online", "Startups that want to protect their identity"], docs: ["Logo (if any)", "Applicant PAN & Aadhaar", "MSME certificate (for lower government fee)", "Signed authorization form (we prepare it)"] },
      { name: "Shop & Establishment", text: "State registration for shops, offices and commercial establishments.", days: "3–7 days" },
      { name: "ISO Registration", text: "ISO certification that shows customers you follow quality standards.", days: "7–15 days" },
      { name: "IEC Registration", text: "Import Export Code — needed to import or export goods and services.", days: "2–4 days", who: ["Exporters and importers", "Businesses selling abroad online", "Traders working with foreign suppliers"], docs: ["PAN card", "Aadhaar card", "Business address proof", "Cancelled cheque"] },
      { name: "GST Filings", text: "Monthly or quarterly GST returns filed on time — no late fees.", days: "Monthly / quarterly" },
      { name: "Annual Returns Filings", text: "Yearly ROC returns and financial statements filed for your company or LLP.", days: "Yearly" },
      { name: "Income Tax Filing", text: "Income tax returns for individuals, firms and companies, filed correctly.", days: "Yearly" },
      { name: "TDS Filing", text: "Quarterly TDS returns filed correctly and on time.", days: "Quarterly" },
      { name: "ESIC Filing", text: "Monthly ESIC contributions and returns for your employees.", days: "Monthly" },
      { name: "PF Filings", text: "Monthly provident fund (EPF) returns and challans for your staff.", days: "Monthly" },
      { name: "Corporate Advisory", text: "Guidance on structure, compliance and growth decisions for your business." },
      { name: "Name Approval & Structuring", text: "Check name availability and choose the right business structure.", days: "2–5 days" },
      { name: "MOA / AOA Legal Drafting", text: "Memorandum and Articles of Association drafted for your company.", days: "2–4 days" },
      { name: "Contract Drafting", text: "Clear agreements for clients, vendors, partners and employees.", days: "2–5 days" },
      { name: "Auditor Appointment", text: "Appointment of your company's statutory auditor with the ROC filing.", days: "Within 30 days of incorporation" },
      { name: "Director KYC (DIR-3)", text: "Yearly DIR-3 KYC for directors so their DIN stays active.", days: "Yearly" },
      { name: "Commencement of Business Filing", text: "INC-20A filing so your new company can start business legally.", days: "Within 180 days of incorporation" },
      { name: "ROC Compliance Calendar & Reminders", text: "A clear compliance calendar with reminders before every ROC deadline.", days: "Yearly" },
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
    menuItems: ["Logo Design", "Brand Identity Design", "Brand Guidelines", "Business Card", "Letter Head", "Company Profile", "Rebranding"],
    who: ["New businesses that need a look", "Businesses with an old or unclear brand", "Shops, clinics, cafes and startups"],
    includes: ["Short call to understand your business", "2–3 design options to choose from", "Changes until you are happy", "Final files for print and online (PNG, PDF, SVG)"],
    services: [
      { name: "Logo Design", text: "A unique logo with all the files you need for print and online." },
      { name: "Brand Guidelines", text: "Rules for your logo, colours and fonts so your brand always looks the same." },
      { name: "Letter Head", text: "Professional letterhead for invoices, quotes and official letters." },
      { name: "Business Card", text: "Visiting cards that look premium and print perfectly." },
      { name: "ID Card", text: "Staff and visitor ID cards in your brand style." },
      { name: "Badge Design", text: "Badges for staff, events and achievements." },
      { name: "T-Shirt Design", text: "Branded t-shirts for your team, events and promotions." },
      { name: "Stamp Design", text: "Company stamp and seal designs." },
      { name: "Bi-Fold Brochure", text: "A two-panel brochure that explains your business clearly." },
      { name: "Tri-Fold Brochure", text: "A three-panel brochure for services, products and offers." },
      { name: "Leaflet", text: "Single-page leaflets for promotions and handouts." },
      { name: "Company Profile", text: "A polished document that introduces your company to clients." },
      { name: "Folder Design", text: "Presentation folders for proposals and documents." },
      { name: "Magazine Design", text: "Magazine layouts with clean, readable pages." },
      { name: "Poster Designs", text: "Eye-catching posters with one clear message." },
      { name: "Mockup Presentation", text: "See your logo and designs on real-life mockups before printing." },
      { name: "PPT Presentations", text: "Professional slides for pitches, meetings and training." },
      { name: "CD Cover Design", text: "Cover and label designs for CDs and media packs." },
      { name: "Brand Strategy", text: "Positioning, audience and messaging that set your brand apart." },
      { name: "Brand Identity Design", text: "A complete visual identity — logo, colours, fonts and style." },
      { name: "Rebranding", text: "Give your existing brand a fresh, modern and premium look." },
      { name: "Brand Naming", text: "Help choosing a memorable, meaningful name for your business." },
      { name: "Tagline Creation", text: "A short, powerful line that sums up your brand." },
      { name: "Brand Voice Guide", text: "How your brand should sound in posts, ads and messages." },
      { name: "Email Signature Design", text: "A professional email signature for Gmail and Outlook." },
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
    menuItems: ["Social Media Post Design", "Brochure Design", "Flyer / Posters", "Package Designs", "Hoarding Designs", "Digital Ad Creative Design", "YouTube Thumbnail Design"],
    who: ["Businesses printing marketing material", "Shops and restaurants", "Event and exhibition teams"],
    includes: ["Design based on your brand", "Ready-to-print files with correct size", "Changes included", "Help with printing if needed"],
    services: [
      { name: "Print Media Designs", text: "Newspaper ads and print designs made to the right size." },
      { name: "Newsletter Designs", text: "Email and print newsletters that are easy to read." },
      { name: "Package Designs", text: "Product box and label designs that stand out on the shelf." },
      { name: "Hoarding Designs", text: "Large hoardings that can be read from far away." },
      { name: "ID Card", text: "ID cards for staff, students and events." },
      { name: "Flex Design", text: "Flex banners for shops, events and promotions." },
      { name: "Flyer / Posters", text: "Flyers and posters that grab attention." },
      { name: "Stationery Design", text: "Matching stationery — envelopes, notepads, letterheads and more." },
      { name: "Illustrations", text: "Custom illustrations for your brand, posts and print." },
      { name: "Award Design", text: "Award and trophy plate designs for events." },
      { name: "Certificate Design", text: "Certificates for courses, events and achievements." },
      { name: "Company Profile", text: "Company profile design with a clean, premium layout." },
      { name: "PPT Presentations", text: "Presentation designs for pitches and meetings." },
      { name: "Brochure Design", text: "Brochures that explain your products and services clearly." },
      { name: "Leaflet Design", text: "Leaflets for offers, launches and handouts." },
      { name: "Social Media Post Design", text: "Ready-to-post designs for Instagram, Facebook and LinkedIn." },
      { name: "Digital Ad Creative Design", text: "Ad creatives sized for Meta and Google ads." },
      { name: "Website Banner Design", text: "Banners for your website, offers and landing pages." },
      { name: "YouTube Thumbnail Design", text: "Thumbnails that get more clicks." },
      { name: "Menu Design", text: "Easy-to-read menus for restaurants, cafes and cloud kitchens." },
      { name: "Catalog Design", text: "Product catalogues that are easy to browse." },
      { name: "Ebook Design", text: "Ebook layouts and covers for lead magnets and guides." },
      { name: "Infographic Design", text: "Turn data and ideas into simple visuals." },
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
    menuItems: ["Social Media Management", "Instagram Management", "Facebook Page Management", "Monthly Content Calendar", "Reel Content Planning", "Ads Boosting"],
    who: ["Businesses with no time for social media", "Shops and brands that want more enquiries", "Anyone starting on Instagram or Facebook"],
    includes: ["Monthly plan shared in advance", "Designed posts and captions", "Posting on time", "Simple monthly report"],
    services: [
      { name: "Creative Posters", text: "Scroll-stopping posters for your social pages." },
      { name: "Campaign Strategies", text: "Planned campaigns for launches, offers and festivals." },
      { name: "Profile Tagger", text: "Tagging and profile mentions that improve your reach." },
      { name: "Ads Boosting", text: "Boosted posts and ads that reach the right people." },
      { name: "Cover Designs", text: "Cover images for Facebook, LinkedIn and YouTube." },
      { name: "Promo Videos", text: "Short promo videos for reels, stories and WhatsApp status." },
      { name: "Creative Writing", text: "Engaging posts, stories and copy for your brand." },
      { name: "Animated GIFs", text: "Simple animations that make your posts stand out." },
      { name: "Social Media Management", text: "We run your pages — planning, posting and monthly reports." },
      { name: "Monthly Content Calendar", text: "A full month of content planned and approved in advance." },
      { name: "Instagram Management", text: "Posts, reels, stories and highlights handled for you." },
      { name: "Facebook Page Management", text: "Regular posts and an active, professional Facebook page." },
      { name: "Caption Writing", text: "Captions written in your brand's voice." },
      { name: "Hashtag Research", text: "The right hashtags to reach your audience." },
      { name: "Reel Content Planning", text: "Reel ideas with hooks, scripts and music suggestions." },
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
    menuItems: ["WordPress Website Development", "Ecommerce Website Development", "Landing Page Development", "Website Redesign", "Domain and Hosting Setup", "Website Maintenance"],
    who: ["Businesses without a website", "Businesses with an old or slow website", "Shops that want to sell online"],
    includes: ["Mobile-friendly design", "Domain, hosting and SSL setup", "Contact form and WhatsApp button", "Basic Google setup (SEO)", "1 month free support"],
    services: [
      { name: "Slideshows", text: "Image and banner slideshows for your home page." },
      { name: "Responsive Designs", text: "A website that looks great on mobile, tablet and desktop." },
      { name: "Custom Forms", text: "Enquiry, booking and application forms built for your needs." },
      { name: "SMS Integrations", text: "Send SMS alerts and confirmations from your website." },
      { name: "Email Integrations", text: "Automatic emails for enquiries, orders and newsletters." },
      { name: "Members Login / Register", text: "Member sign-up and login areas for your website." },
      { name: "SEO Friendly", text: "Built so customers can find you on Google." },
      { name: "Gallery", text: "Photo and video galleries to show your work." },
      { name: "Members Directory", text: "A searchable directory of members or partners." },
      { name: "Product Showcase", text: "Show your products with photos, details and enquiry buttons." },
      { name: "Payment Gateway", text: "Accept UPI, cards and net banking on your website." },
      { name: "Social Feeds", text: "Show your latest Instagram and social posts on your site." },
      { name: "WordPress Website Development", text: "An easy-to-edit WordPress website you can update yourself." },
      { name: "Landing Page Development", text: "A focused page made for one offer or ad campaign." },
      { name: "Ecommerce Website Development", text: "Sell online with cart, payments and order tracking." },
      { name: "Website Redesign", text: "Make your old website modern, fast and mobile-friendly." },
      { name: "Website Maintenance", text: "Updates, backups and small changes every month." },
      { name: "Website Speed Optimization", text: "Make your slow website load fast." },
      { name: "Domain and Hosting Setup", text: "Your domain and hosting set up in your name." },
      { name: "SSL Certificate Setup", text: "The secure padlock (https) for your website." },
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
    menuItems: ["AI Chatbot Integration", "WhatsApp AI Reply Setup", "Lead Capture Chatbot", "AI Lead Follow-Up Automation", "Custom GPT Setup", "AI Staff Training Session"],
    who: ["Businesses getting many repeat questions", "Teams that miss enquiries after hours", "Owners who want to save time"],
    includes: ["Setup on your WhatsApp or website", "Trained on your business details", "Testing before going live", "Simple training for your team"],
    services: [
      { name: "AI Chatbot Integration", text: "An AI chatbot on your website that answers customers 24×7." },
      { name: "Website FAQ Chatbot", text: "A chatbot that answers your most common questions instantly." },
      { name: "Lead Capture Chatbot", text: "A chatbot that collects names and numbers from visitors." },
      { name: "Appointment Booking Chatbot", text: "Customers book a time slot themselves, with reminders." },
      { name: "Customer Support Chatbot Setup", text: "First-line support that answers and routes customer queries." },
      { name: "WhatsApp AI Reply Setup", text: "Smart, instant replies to customer questions on WhatsApp." },
      { name: "AI Email Reply Assistant", text: "Draft clear email replies in seconds." },
      { name: "AI Lead Follow-Up Automation", text: "Automatic follow-ups so no enquiry goes cold." },
      { name: "AI Contact Form Response Automation", text: "Instant, personal replies to every contact-form enquiry." },
      { name: "AI Quote Request Assistant", text: "Collect requirements and prepare quote requests automatically." },
      { name: "AI Proposal Draft Generator", text: "Ready-to-edit proposal drafts for your clients." },
      { name: "AI Invoice Message Generator", text: "Polite invoice and payment-reminder messages." },
      { name: "AI Review Response Generator", text: "Quick, professional replies to your Google reviews." },
      { name: "AI Social Media Caption Generator", text: "Captions for your posts in your brand's voice." },
      { name: "AI Content Calendar Generator", text: "A month of content ideas planned with AI." },
      { name: "AI Blog Ideas Generator", text: "Fresh blog topics your customers are searching for." },
      { name: "AI Website Copy Suggestions", text: "Better headlines and page text for your website." },
      { name: "AI Ad Copy Ideas Generator", text: "Ad copy ideas ready to test on Meta and Google." },
      { name: "AI Hashtag Suggestions", text: "Relevant hashtags for every post." },
      { name: "AI Reel Ideas Generator", text: "Reel ideas and hooks for your niche." },
      { name: "AI Customer Feedback Summary", text: "Turn customer feedback into clear, simple insights." },
      { name: "AI FAQ Generator", text: "FAQs for your website written from your business details." },
      { name: "Custom GPT Setup", text: "A custom ChatGPT assistant trained on your business information." },
      { name: "AI Prompt Pack for Business", text: "Ready-made prompts for marketing, sales and daily work." },
      { name: "AI Staff Training Session", text: "Hands-on training so your team can use AI every day." },
      { name: "AI Workflow with Zapier", text: "Connect your apps and automate tasks with Zapier and AI." },
      { name: "AI Workflow with Make", text: "Automated workflows built on Make (formerly Integromat)." },
      { name: "AI Google Sheets Automation", text: "Sheets that fill and update themselves." },
      { name: "AI CRM Update Automation", text: "Keep your CRM up to date without manual typing." },
      { name: "AI Knowledge Base Setup", text: "A searchable knowledge base for your team and customers." },
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

/** Services renamed when the full 143-service catalogue was added (old name → new name). Old web addresses redirect to the new ones. */
export const OLD_SERVICE_NAMES: Record<string, string> = {
  "Company Registration (Pvt Ltd)": "Private Limited Registration",
  "Proprietorship / Firm Registration": "Firm Registration",
  "MSME / Udyam": "Udyam / MSME Registration",
  "Trademark": "Trademark Registration",
  "FSSAI (Food License)": "FSSAI Registration",
  "Import Export Code (IEC)": "IEC Registration",
  "ISO Certification": "ISO Registration",
  "GST & Income Tax Filing": "GST Filings",
  "TDS, PF & ESIC Filing": "TDS Filing",
  "Company Yearly Compliance": "Annual Returns Filings",
  "Letterhead": "Letter Head",
  "Brand Name & Tagline": "Brand Naming",
  "Full Brand Kit": "Brand Guidelines",
  "ID Cards & Stamps": "Stamp Design",
  "T-Shirt & Merchandise": "T-Shirt Design",
  "Email Signature": "Email Signature Design",
  "Brochure": "Brochure Design",
  "Flyer & Poster": "Flyer / Posters",
  "Packaging": "Package Designs",
  "Flex & Hoarding": "Hoarding Designs",
  "Menu Card": "Menu Design",
  "Certificates & ID Cards": "Certificate Design",
  "Catalogue": "Catalog Design",
  "Presentation (PPT)": "PPT Presentations",
  "YouTube Thumbnail": "YouTube Thumbnail Design",
  "Newspaper Ad": "Print Media Designs",
  "Instagram & Facebook Handling": "Social Media Management",
  "Monthly Posts": "Monthly Content Calendar",
  "Reels Planning": "Reel Content Planning",
  "Paid Ads (Boosting)": "Ads Boosting",
  "Captions & Hashtags": "Caption Writing",
  "Profile Setup": "Cover Designs",
  "Business Website": "Responsive Designs",
  "Online Store": "Ecommerce Website Development",
  "Landing Page": "Landing Page Development",
  "WordPress Website": "WordPress Website Development",
  "Domain & Hosting": "Domain and Hosting Setup",
  "Google Ranking (SEO)": "SEO Friendly",
  "Speed Improvement": "Website Speed Optimization",
  "WhatsApp Auto-Reply": "WhatsApp AI Reply Setup",
  "Website Chatbot": "Website FAQ Chatbot",
  "Lead Follow-up Automation": "AI Lead Follow-Up Automation",
  "Appointment Booking Bot": "Appointment Booking Chatbot",
  "Google Review Replies": "AI Review Response Generator",
  "Google Sheets & CRM Automation": "AI Google Sheets Automation",
  "Custom ChatGPT for Business": "Custom GPT Setup",
  "AI Training for Staff": "AI Staff Training Session"
};

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
  { name: "Private Limited Registration", cat: "registration", days: "7–10 days" },
  { name: "Trademark Registration", cat: "registration", days: "File in 2–3 days" },
  { name: "Udyam / MSME Registration", cat: "registration", days: "1–2 days" },
  { name: "Logo Design", cat: "branding", days: "3–5 days" },
  { name: "WordPress Website Development", cat: "website", days: "2–3 weeks" },
  { name: "Social Media Management", cat: "social-media", days: "Monthly plan" },
  { name: "WhatsApp AI Reply Setup", cat: "ai-tools", days: "Ready in 1 week" },
];

export const findService = (catSlug: string, serviceSlug: string) => {
  const cat = CATEGORIES.find((c) => c.slug === catSlug);
  const service = cat?.services.find((x) => slugify(x.name) === serviceSlug);
  return { cat, service };
};

export const serviceUrl = (catSlug: string, name: string) => `/services/${catSlug}/${slugify(name)}`;

export const waLink = (number: string, text = "Hi, I need help with your services") =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
