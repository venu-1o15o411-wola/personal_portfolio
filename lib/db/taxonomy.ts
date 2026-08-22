export type TaxonomyNode = {
  code: string;
  slug: string;
  name: string;
  subcategories: { slug: string; name: string }[];
};

export const TAXONOMY: TaxonomyNode[] = [
  {
    code: "01",
    slug: "ai-automation",
    name: "AI & Automation",
    subcategories: [
      { slug: "ai-integration", name: "AI Integration" },
      { slug: "ai-agents", name: "AI Agents" },
      { slug: "chatbots", name: "Chatbots" },
      { slug: "rag", name: "RAG" },
      { slug: "workflow-automation", name: "Workflow Automation" },
      { slug: "voice-ai", name: "Voice AI" },
    ],
  },
  {
    code: "02",
    slug: "software-development",
    name: "Software Development",
    subcategories: [
      { slug: "full-stack", name: "Full Stack" },
      { slug: "frontend", name: "Frontend" },
      { slug: "backend", name: "Backend" },
      { slug: "saas", name: "SaaS" },
      { slug: "apis", name: "APIs" },
      { slug: "internal-tools", name: "Internal Tools" },
    ],
  },
  {
    code: "03",
    slug: "data",
    name: "Data",
    subcategories: [
      { slug: "analytics", name: "Analytics" },
      { slug: "visualization", name: "Visualization" },
      { slug: "data-engineering", name: "Data Engineering" },
      { slug: "scraping", name: "Scraping" },
      { slug: "ml", name: "ML" },
      { slug: "reporting", name: "Reporting" },
    ],
  },
  {
    code: "04",
    slug: "ecommerce",
    name: "Ecommerce",
    subcategories: [
      { slug: "shopify", name: "Shopify" },
      { slug: "wordpress", name: "WordPress" },
      { slug: "woocommerce", name: "WooCommerce" },
      { slug: "webflow", name: "Webflow" },
      { slug: "ecommerce-automation", name: "Ecommerce Automation" },
    ],
  },
  {
    code: "05",
    slug: "mobile",
    name: "Mobile",
    subcategories: [
      { slug: "ios", name: "iOS" },
      { slug: "android", name: "Android" },
      { slug: "flutter", name: "Flutter" },
      { slug: "react-native", name: "React Native" },
    ],
  },
  {
    code: "06",
    slug: "ux-ui",
    name: "UX/UI",
    subcategories: [
      { slug: "website", name: "Website" },
      { slug: "mobile-ui", name: "Mobile" },
      { slug: "saas-ui", name: "SaaS" },
      { slug: "dashboard", name: "Dashboard" },
      { slug: "landing-page", name: "Landing Page" },
    ],
  },
  {
    code: "07",
    slug: "marketing",
    name: "Marketing",
    subcategories: [
      { slug: "seo", name: "SEO" },
      { slug: "paid-ads", name: "Paid Ads" },
      { slug: "email", name: "Email" },
      { slug: "lead-generation", name: "Lead Generation" },
      { slug: "social", name: "Social" },
      { slug: "marketing-automation", name: "Marketing Automation" },
    ],
  },
  {
    code: "08",
    slug: "cloud-devops",
    name: "Cloud & DevOps",
    subcategories: [
      { slug: "aws", name: "AWS" },
      { slug: "azure", name: "Azure" },
      { slug: "docker", name: "Docker" },
      { slug: "kubernetes", name: "Kubernetes" },
      { slug: "ci-cd", name: "CI/CD" },
      { slug: "infrastructure", name: "Infrastructure" },
    ],
  },
  {
    code: "09",
    slug: "business-systems",
    name: "Business Systems",
    subcategories: [
      { slug: "crm", name: "CRM" },
      { slug: "google-workspace", name: "Google Workspace" },
      { slug: "microsoft-365", name: "Microsoft 365" },
      { slug: "airtable", name: "Airtable" },
      { slug: "zapier", name: "Zapier" },
      { slug: "make", name: "Make" },
      { slug: "n8n", name: "n8n" },
    ],
  },
  {
    code: "10",
    slug: "creative",
    name: "Creative",
    subcategories: [
      { slug: "graphic-design", name: "Graphic Design" },
      { slug: "branding", name: "Branding" },
      { slug: "video", name: "Video" },
      { slug: "presentation", name: "Presentation" },
      { slug: "three-d", name: "3D" },
      { slug: "ai-creative", name: "AI Creative" },
    ],
  },
];
