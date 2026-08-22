import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

type SampleProject = {
  slug: string;
  title: string;
  pitch: string;
  subcategorySlug: string;
  extraSubcategorySlugs: string[];
  tags: string[];
  techStack: string[];
  theAsk: string;
  walkedInto: string;
  theBuild: string;
  inTheirHands: string;
  clientNote: string;
  liveUrl?: string;
  role: string;
  duration: string;
  featured: boolean;
  aiSummary: string;
  cover: string;
  metrics: { value: string; label: string }[];
  images: { file: string; caption: string; kind?: "image" | "video"; poster?: string }[];
};

const PHOTO = {
  dashboard: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=80",
  laptop: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1800&q=80",
  team: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1800&q=80",
  code: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=80",
  office: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1800&q=80",
  meeting: "https://images.unsplash.com/photo-1542744173-8eaaec5756c5?auto=format&fit=crop&w=1800&q=80",
  mobile: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1800&q=80",
  warehouse: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1800&q=80",
  analytics: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=80",
  slack: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1800&q=80",
  shop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=80",
  map: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1800&q=80",
};

const DEMO_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

const SAMPLES: SampleProject[] = [
  {
    slug: "legal-ops-knowledge-desk",
    title: "Legal ops knowledge desk",
    pitch: "A private RAG workspace that answers from contracts, playbooks, and prior matters — with citations, not guesses.",
    subcategorySlug: "rag",
    extraSubcategorySlugs: ["ai-agents", "internal-tools"],
    tags: ["legaltech", "retrieval", "citations", "internal search"],
    techStack: ["Next.js", "OpenAI", "pgvector", "LangChain", "Vercel"],
    theAsk:
      "Kickoff with the GC: sales kept pinging the same MSA clauses, and they were done with vendors who demo a chatbot that hallucinates contracts. They posted it as RAG. What they meant was stop the Slack fire drill.",
    walkedInto:
      "Drive was a junk drawer — about 12k pages, no ACL, three people still answering with PDF screenshots. A previous bot had cited the wrong DPA. Counsel did not trust search, and they were right not to.",
    theBuild:
      "Week one I sat with counsel on 20 real questions and marked what good looked like: quote the span or refuse. Then hybrid retrieval, matter-level ACLs, and a review queue they actually used. I did not ship a chatbot. I shipped a desk they could yell at.",
    inTheirHands:
      "They open the desk instead of Slack. Repeat questions went from about 35 minutes to under 90 seconds. Citation accuracy on the golden set hit 94%. Sales still routes legal through it — deals do not sit a day waiting on a clause.",
    clientNote:
      "We stopped answering the same MSA question in Slack. The desk either cites the clause or it shuts up.",
    liveUrl: "https://example.com/legal-desk",
    role: "Lead engineer",
    duration: "8 weeks",
    featured: true,
    aiSummary:
      "Internal RAG desk for legal ops: hybrid retrieval over contracts and playbooks, citation-first answers, ACL-aware index, and a counsel review loop. Next.js, OpenAI, pgvector. Cut repeat research from 35 minutes to under 90 seconds.",
    cover: PHOTO.dashboard,
    metrics: [
      { value: "90s", label: "Median time-to-answer" },
      { value: "94%", label: "Citation accuracy" },
      { value: "12k", label: "Pages in the corpus" },
    ],
    images: [
      { file: PHOTO.dashboard, caption: "Ask view — answers only with cited spans" },
      { file: PHOTO.laptop, caption: "Source drawer with matter ACL badge" },
      { file: PHOTO.code, caption: "Hybrid retrieval + rerank pipeline" },
      { file: PHOTO.team, caption: "Counsel review queue for canonical answers" },
      { file: PHOTO.office, caption: "Admin: re-ingest, eval set, ACL mapping" },
      {
        file: DEMO_VIDEO,
        caption: "Walkthrough: question → retrieved clauses → cited answer",
        kind: "video",
        poster: PHOTO.dashboard,
      },
    ],
  },
  {
    slug: "field-service-ops-platform",
    title: "Field service ops platform",
    pitch: "A SaaS console for dispatch, technician routes, and customer ETAs — replacing a tangle of spreadsheets and SMS.",
    subcategorySlug: "saas",
    extraSubcategorySlugs: ["full-stack", "dashboard"],
    tags: ["field service", "dispatch", "SaaS", "operations"],
    techStack: ["Next.js", "PostgreSQL", "Prisma", "Mapbox", "Stripe", "Twilio"],
    theAsk:
      "The owner on kickoff: he did not want an ERP. He wanted the spreadsheet to stop lying about where the trucks were. Twenty-eight technicians, jobs in Sheets, customer ETAs by phone.",
    walkedInto:
      "Two spreadsheets, a group text, invoicing a week behind. Same-day reschedules collided because nobody owned the board. I rode along on a Tuesday just to hear the radio chatter the software was supposed to replace.",
    theBuild:
      "I put a job state machine on the wall with them — quoted, scheduled, en route, done, invoiced — then built the board around it. Live Mapbox, SMS ETA links, Stripe from the completed job. Office, techs, and the owner each got a different door into the same record.",
    inTheirHands:
      "The board is the operating system. On-time arrivals were up 22% in 60 days. Invoices go out the same day. He is running two extra crews without hiring a coordinator.",
    clientNote:
      "I check the board the way I used to check the shop whiteboard. If it is not on there, it did not happen.",
    liveUrl: "https://example.com/field-ops",
    role: "Full-stack engineer",
    duration: "12 weeks",
    featured: true,
    aiSummary:
      "Multi-tenant field service SaaS: dispatch board, live routing, SMS ETAs, parts, and Stripe invoicing from a job state machine. Next.js, Postgres, Mapbox, Twilio. On-time arrivals +22%, invoicing moved to same-day.",
    cover: PHOTO.map,
    metrics: [
      { value: "+22%", label: "On-time arrivals" },
      { value: "Same day", label: "Invoice lag" },
      { value: "28", label: "Technicians on the board" },
    ],
    images: [
      { file: PHOTO.map, caption: "Live dispatch map with technician positions" },
      { file: PHOTO.dashboard, caption: "Job board and state machine" },
      { file: PHOTO.mobile, caption: "Customer ETA link on mobile" },
      { file: PHOTO.warehouse, caption: "Parts pulled into the completed job" },
      { file: PHOTO.laptop, caption: "Owner dashboard — crews, utilization, cash" },
      {
        file: DEMO_VIDEO,
        caption: "Walkthrough: quote → schedule → en route → invoice",
        kind: "video",
        poster: PHOTO.map,
      },
    ],
  },
  {
    slug: "shopify-replenishment-engine",
    title: "Shopify replenishment engine",
    pitch: "Automated purchase orders from forecasted sell-through — Shopify inventory, supplier rules, and Slack approvals.",
    subcategorySlug: "shopify",
    extraSubcategorySlugs: ["n8n", "ecommerce-automation"],
    tags: ["shopify", "inventory", "ops automation", "D2C"],
    techStack: ["Shopify Admin API", "n8n", "Airtable", "Slack", "Google Sheets"],
    theAsk:
      "Founder on a Monday Zoom, sharing her screen: she rebuilt a reorder spreadsheet every week from a Shopify export. She needed it to stop living in her head — without buying an ERP.",
    walkedInto:
      "Hero SKUs stocked out while slow movers piled up. Supplier POs in three formats. Approvals were a Slack thumbs-up that vanished. Nothing was written down.",
    theBuild:
      "I pulled 90-day sell-through with her, set reorder points (lead time plus safety), and grouped drafts by supplier. Slack card: quantities, cost, weeks-of-cover. Approve wrote an Airtable PO and emailed the supplier CSV. New SKUs and MOQ clashes stayed in a human lane — she kept the judgment.",
    inTheirHands:
      "Monday is a 12-minute Slack review. Stock-outs on the top 20 SKUs dropped 61% over a quarter. She still catches exceptions; the machine does the rest.",
    clientNote:
      "I still say no to the weird POs. I just do not spend Monday building the list.",
    role: "Automation engineer",
    duration: "5 weeks",
    featured: false,
    aiSummary:
      "Shopify replenishment automation: velocity-based reorder points, supplier-grouped POs, Slack approval, Airtable + email output via n8n. Cut top-SKU stock-outs 61% and collapsed Monday reorder work to a 12-minute review.",
    cover: PHOTO.shop,
    metrics: [
      { value: "−61%", label: "Stock-outs on top 20 SKUs" },
      { value: "12 min", label: "Monday reorder review" },
      { value: "90d", label: "Sell-through window" },
    ],
    images: [
      { file: PHOTO.shop, caption: "Reorder queue grouped by supplier" },
      { file: PHOTO.slack, caption: "Slack approval card with weeks-of-cover" },
      { file: PHOTO.warehouse, caption: "Incoming POs vs on-hand" },
      { file: PHOTO.dashboard, caption: "Exception lane: MOQ, new SKU, spikes" },
      { file: PHOTO.laptop, caption: "Airtable PO written after approval" },
      {
        file: DEMO_VIDEO,
        caption: "Walkthrough: velocity → draft PO → Slack approve",
        kind: "video",
        poster: PHOTO.shop,
      },
    ],
  },
  {
    slug: "dtc-revenue-cockpit",
    title: "D2C revenue cockpit",
    pitch: "A daily executive dashboard: contribution margin, cohort LTV, and paid-channel payback — not vanity sessions.",
    subcategorySlug: "visualization",
    extraSubcategorySlugs: ["analytics", "reporting"],
    tags: ["ecommerce analytics", "LTV", "paid ads", "executive dashboard"],
    techStack: ["dbt", "BigQuery", "Metabase", "Shopify", "Klaviyo", "Google Ads"],
    theAsk:
      "CEO, CMO, and finance on the same call, already arguing: paid looked profitable in-platform and dead in the P&L. They wanted one number in the morning — not another dashboard nobody opened.",
    walkedInto:
      "Shopify’s homepage plus three Google Sheets. Nobody agreed on contribution margin or 60-day payback. I spent the first week in finance’s metric dictionary, not in Figma.",
    theBuild:
      "Orders, refunds, COGS, shipping, and ads into dbt on BigQuery. UTM plus Klaviyo waterfall, written down. Three views they would actually open: today vs target, cohort LTV, creative MER. A 7am Slack digest. The UI did not ship until finance signed the dictionary.",
    inTheirHands:
      "The three sheets were retired in two weeks. A bad prospecting set got cut in 10 days instead of running a month. Prospecting payback moved from 78 to 51 days the next quarter.",
    clientNote:
      "We finally fight about the ads, not about whose spreadsheet is right.",
    role: "Analytics engineer",
    duration: "6 weeks",
    featured: false,
    aiSummary:
      "Executive D2C cockpit on BigQuery + dbt + Metabase: contribution margin, cohort LTV, and paid payback with a signed metric dictionary. Replaced three sheets; prospecting payback moved from 78 to 51 days.",
    cover: PHOTO.analytics,
    metrics: [
      { value: "51d", label: "Prospecting payback" },
      { value: "3", label: "Sheets retired" },
      { value: "7am", label: "Daily Slack digest" },
    ],
    images: [
      { file: PHOTO.analytics, caption: "Morning cockpit — plan vs actual" },
      { file: PHOTO.laptop, caption: "Cohort LTV curves" },
      { file: PHOTO.dashboard, caption: "Creative-level MER" },
      { file: PHOTO.meeting, caption: "Metric dictionary signed by finance" },
      { file: PHOTO.office, caption: "Channel waterfall: UTM + Klaviyo" },
      {
        file: DEMO_VIDEO,
        caption: "Walkthrough: today vs target, LTV, payback",
        kind: "video",
        poster: PHOTO.analytics,
      },
    ],
  },
  {
    slug: "hubspot-lead-routing",
    title: "HubSpot lead routing",
    pitch: "Inbound leads scored, routed, and followed up in Slack and email — no more ‘who owns this?’ in the CRM.",
    subcategorySlug: "n8n",
    extraSubcategorySlugs: ["crm", "lead-generation", "workflow-automation"],
    tags: ["hubspot", "lead routing", "B2B", "sales ops"],
    techStack: ["HubSpot", "n8n", "Slack", "OpenAI", "Clearbit"],
    theAsk:
      "Sales manager: demo requests sat in HubSpot until someone noticed. He wanted them in Slack, owned, with a reason he could point at when two AEs argued.",
    walkedInto:
      "Nine AEs. Territory rules lived in a Notion page nobody updated. High-intent demos waited overnight. I watched a form fill sit for four hours during standup.",
    theBuild:
      "n8n on form and chat. Clearbit plus a light pass on the message for fit and intent. Round-robin inside territory, VIPs pinned to named AEs. Slack card with the score and a reassign button. Sequence starts after assignment. Fifteen-minute SLA pages the manager. Every decision writes a HubSpot note.",
    inTheirHands:
      "Median first-touch went from 4.6 hours to 11 minutes. Demo response under 15 minutes went from 41% to 93%. Duplicate-owner tickets basically disappeared because the reason is on the record.",
    clientNote:
      "If two people grab the same lead now, we open the note. The argument is over in a minute.",
    role: "RevOps engineer",
    duration: "3 weeks",
    featured: true,
    aiSummary:
      "HubSpot inbound routing via n8n: enrichment, fit/intent scoring, territory round-robin, Slack cards, and SLA pings. First-touch from 4.6 hours to 11 minutes; sub-15-minute demo response from 41% to 93%.",
    cover: PHOTO.slack,
    metrics: [
      { value: "11 min", label: "Median first-touch" },
      { value: "93%", label: "Demos answered < 15 min" },
      { value: "15 min", label: "Manager SLA page" },
    ],
    images: [
      { file: PHOTO.slack, caption: "Owner card with score breakdown" },
      { file: PHOTO.dashboard, caption: "Fit vs intent scoring" },
      { file: PHOTO.team, caption: "Territory round-robin" },
      { file: PHOTO.laptop, caption: "Assignment reason on the HubSpot record" },
      { file: PHOTO.mobile, caption: "SLA ping to the manager" },
      {
        file: DEMO_VIDEO,
        caption: "Walkthrough: form fill → enrich → assign → Slack",
        kind: "video",
        poster: PHOTO.slack,
      },
    ],
  },
];

function svgCover(opts: {
  code: string;
  kicker: string;
  title: string;
  line: string;
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" role="img" aria-label="${opts.title}">
  <rect width="1600" height="1000" fill="#0c0b0a"/>
  <rect x="72" y="72" width="1456" height="856" fill="none" stroke="#c4a574" stroke-opacity="0.35"/>
  <text x="110" y="160" fill="#c4a574" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="22" letter-spacing="8">${opts.code}</text>
  <text x="110" y="200" fill="#9a9186" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="18" letter-spacing="6">${opts.kicker}</text>
  <text x="110" y="430" fill="#f4efe6" font-family="Georgia, 'Times New Roman', serif" font-size="72">${opts.title}</text>
  <line x1="110" y1="490" x2="420" y2="490" stroke="#c4a574" stroke-width="2"/>
  <text x="110" y="560" fill="#9a9186" font-family="Georgia, 'Times New Roman', serif" font-size="28">${opts.line}</text>
</svg>`;
}

function svgUi(opts: { title: string; a: string; b: string; c: string }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" role="img" aria-label="${opts.title}">
  <rect width="1600" height="1000" fill="#161412"/>
  <rect x="80" y="80" width="1440" height="840" rx="18" fill="#0c0b0a" stroke="rgba(244,239,230,0.1)"/>
  <circle cx="130" cy="130" r="8" fill="#c4a574"/>
  <circle cx="160" cy="130" r="8" fill="#9a9186"/>
  <circle cx="190" cy="130" r="8" fill="#9a9186"/>
  <text x="230" y="138" fill="#9a9186" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="18">${opts.title}</text>
  <rect x="120" y="200" width="640" height="640" rx="12" fill="#221f1b"/>
  <rect x="800" y="200" width="640" height="190" rx="12" fill="#221f1b"/>
  <rect x="800" y="420" width="640" height="190" rx="12" fill="#221f1b"/>
  <rect x="800" y="640" width="640" height="200" rx="12" fill="#221f1b"/>
  <text x="160" y="280" fill="#f4efe6" font-family="Georgia, serif" font-size="36">${opts.a}</text>
  <text x="840" y="280" fill="#c4a574" font-family="ui-monospace, Menlo, monospace" font-size="20">${opts.b}</text>
  <text x="840" y="500" fill="#f4efe6" font-family="Georgia, serif" font-size="28">${opts.c}</text>
</svg>`;
}

export const SAMPLE_ASSETS: Record<string, string> = {
  "/samples/legal-ops-cover.svg": svgCover({
    code: "01  RAG",
    kicker: "AI & AUTOMATION",
    title: "Legal ops knowledge desk",
    line: "Answers with citations, not guesses.",
  }),
  "/samples/legal-ops-ui.svg": svgUi({
    title: "knowledge-desk / matter ACL",
    a: "Cited clause · DPA §4.2",
    b: "SOURCE  ·  94% eval",
    c: "Counsel review queue is clear.",
  }),
  "/samples/field-ops-cover.svg": svgCover({
    code: "02  SAAS",
    kicker: "SOFTWARE DEVELOPMENT",
    title: "Field service ops",
    line: "Dispatch, routes, and same-day invoices.",
  }),
  "/samples/field-ops-ui.svg": svgUi({
    title: "ops / dispatch",
    a: "28 techs  ·  live board",
    b: "STATE  ·  EN ROUTE",
    c: "SMS ETA linked for the customer.",
  }),
  "/samples/shopify-cover.svg": svgCover({
    code: "04  SHOPIFY",
    kicker: "ECOMMERCE",
    title: "Replenishment engine",
    line: "POs from sell-through, approved in Slack.",
  }),
  "/samples/shopify-ui.svg": svgUi({
    title: "n8n / shopify PO",
    a: "Top 20 SKUs  ·  weeks of cover",
    b: "APPROVAL  ·  SLACK",
    c: "Exceptions stay with the founder.",
  }),
  "/samples/cockpit-cover.svg": svgCover({
    code: "03  DATA",
    kicker: "ANALYTICS",
    title: "D2C revenue cockpit",
    line: "Margin, LTV, and payback — one dictionary.",
  }),
  "/samples/cockpit-ui.svg": svgUi({
    title: "metabase / daily",
    a: "Payback  51 days",
    b: "PLAN  vs  ACTUAL",
    c: "Cohort LTV signed by finance.",
  }),
  "/samples/routing-cover.svg": svgCover({
    code: "09  N8N",
    kicker: "BUSINESS SYSTEMS",
    title: "HubSpot lead routing",
    line: "Scored, assigned, and followed up in minutes.",
  }),
  "/samples/routing-ui.svg": svgUi({
    title: "hubspot / inbound",
    a: "First touch  ·  11 min",
    b: "SLA  ·  15 MIN",
    c: "Routing reason written to the record.",
  }),
};

export function writeSampleAssets() {
  const dir = path.join(process.cwd(), "public", "samples");
  mkdirSync(dir, { recursive: true });
  for (const [urlPath, svg] of Object.entries(SAMPLE_ASSETS)) {
    const filename = urlPath.replace("/samples/", "");
    writeFileSync(path.join(dir, filename), svg);
  }
}

export async function seedSampleProjects(db: PostgresJsDatabase<typeof schema>) {
  const subs = await db.select().from(schema.subcategories);
  const bySlug = new Map(subs.map((sub) => [sub.slug, sub.id]));
  const sampleIds: number[] = [];

  for (const sample of SAMPLES) {
    const subcategoryId = bySlug.get(sample.subcategorySlug);
    if (!subcategoryId) continue;

    const extraSubcategoryIds = sample.extraSubcategorySlugs
      .map((slug) => bySlug.get(slug))
      .filter((id): id is number => typeof id === "number");

    const values = {
      slug: sample.slug,
      title: sample.title,
      pitch: sample.pitch,
      coverImageUrl: sample.cover,
      subcategoryId,
      extraSubcategoryIds,
      tags: sample.tags,
      techStack: sample.techStack,
      theAsk: sample.theAsk,
      walkedInto: sample.walkedInto,
      theBuild: sample.theBuild,
      inTheirHands: sample.inTheirHands,
      clientNote: sample.clientNote,
      liveUrl: sample.liveUrl ?? null,
      role: sample.role,
      duration: sample.duration,
      featured: sample.featured,
      published: true,
      aiSummary: sample.aiSummary,
      metrics: sample.metrics,
      updatedAt: new Date(),
    };

    const existing = await db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .where(eq(schema.projects.slug, sample.slug))
      .limit(1);

    let projectId = existing[0]?.id;
    if (projectId) {
      await db.update(schema.projects).set(values).where(eq(schema.projects.id, projectId));
      await db
        .delete(schema.projectImages)
        .where(eq(schema.projectImages.projectId, projectId));
    } else {
      const inserted = await db
        .insert(schema.projects)
        .values(values)
        .returning({ id: schema.projects.id });
      projectId = inserted[0].id;
    }

    sampleIds.push(projectId);
    await db.insert(schema.projectImages).values(
      sample.images.map((image, index) => ({
        projectId,
        url: image.file,
        caption: image.caption,
        kind: image.kind || "image",
        posterUrl: image.poster || null,
        sortOrder: index,
      })),
    );
  }

  const demoToken = "demo-work";
  const existingShare = await db
    .select({ id: schema.shares.id })
    .from(schema.shares)
    .where(eq(schema.shares.token, demoToken))
    .limit(1);

  if (!existingShare[0] && sampleIds.length > 0) {
    await db.insert(schema.shares).values({
      token: demoToken,
      clientName: "Sample client",
      jobTitle: "Selected case studies",
      jobDescription: "Demo share for local preview.",
      projectIds: sampleIds,
      matchReasons: {
        [String(sampleIds[0])]:
          "Closest overlap: private RAG with citations over an internal corpus.",
      },
    });
  } else if (existingShare[0]) {
    await db
      .update(schema.shares)
      .set({ projectIds: sampleIds })
      .where(eq(schema.shares.id, existingShare[0].id));
  }
}
