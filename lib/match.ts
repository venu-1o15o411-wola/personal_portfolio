import OpenAI from "openai";
import type { ProjectRecord } from "./db/queries";

export const MATCH_MODEL = "gpt-5.6-luna";

export type MatchResult = {
  extracted: {
    domain: string;
    skills: string[];
    deliverables: string[];
    platforms: string[];
  };
  matches: {
    projectId: number;
    score: number;
    reason: string;
  }[];
  usedFallback: boolean;
  model: string | null;
  fallbackReason?: string;
};

function catalogItem(project: ProjectRecord) {
  return {
    id: project.id,
    title: project.title,
    pitch: project.pitch,
    category: project.category.name,
    subcategory: project.subcategory.name,
    tags: project.tags,
    stack: project.techStack,
    summary:
      project.aiSummary ||
      [project.theAsk, project.theBuild, project.inTheirHands].filter(Boolean).join(" ").slice(0, 400),
  };
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function fallbackMatch(jobDescription: string, projects: ProjectRecord[]): MatchResult {
  const tokens = new Set(tokenize(jobDescription));
  const matches = projects
    .map((project) => {
      const haystack = tokenize(
        [
          project.title,
          project.pitch,
          project.category.name,
          project.subcategory.name,
          project.tags.join(" "),
          project.techStack.join(" "),
          project.aiSummary,
          project.theAsk,
          project.walkedInto,
        ].join(" "),
      );
      const overlap = haystack.filter((token) => tokens.has(token));
      const unique = new Set(overlap);
      const score = Math.min(1, unique.size / Math.max(6, Math.min(tokens.size, 18)));
      return {
        projectId: project.id,
        score: Number(score.toFixed(2)),
        reason: unique.size
          ? `Overlaps on ${[...unique].slice(0, 5).join(", ")}.`
          : "Limited keyword overlap — review before sharing.",
      };
    })
    .filter((item) => item.score >= 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  return {
    extracted: {
      domain: "",
      skills: [...tokens].slice(0, 8),
      deliverables: [],
      platforms: [],
    },
    matches,
    usedFallback: true,
    model: null,
    fallbackReason: "OPENAI_API_KEY is not set",
  };
}

export async function generateAiSummary(input: {
  title: string;
  pitch: string;
  stack: string[];
  theAsk: string;
  walkedInto: string;
  theBuild: string;
  inTheirHands: string;
}) {
  const fallback = [input.pitch, input.theAsk, input.inTheirHands, input.stack.join(", ")]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 320);

  if (!process.env.OPENAI_API_KEY) return fallback;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: MATCH_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Write a 45-70 word matching blurb for a freelance engagement. Cover what the client hired for, what was actually built, stack, and what they run now. No marketing fluff.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    });

    return response.choices[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}

export async function matchJobToProjects(
  jobDescription: string,
  projects: ProjectRecord[],
): Promise<MatchResult> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackMatch(jobDescription, projects);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const catalog = projects.map(catalogItem);

  try {
    const response = await openai.chat.completions.create({
      model: MATCH_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You match an Upwork job description to a freelancer's client engagements.
Return JSON only:
{
  "extracted": {
    "domain": "short domain",
    "skills": ["..."],
    "deliverables": ["..."],
    "platforms": ["..."]
  },
  "matches": [
    { "projectId": 1, "score": 0.92, "reason": "one sentence a client could read" }
  ]
}
Rules:
- score is 0 to 1
- only include projects with score >= 0.35
- rank by score descending
- max 12 matches
- reasons must cite a concrete overlap (stack, domain, or deliverable)
- never invent projects that are not in the catalog`,
        },
        {
          role: "user",
          content: JSON.stringify({ jobDescription, catalog }),
        },
      ],
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || "{}") as MatchResult;
    const allowed = new Set(projects.map((project) => project.id));
    const matches = (parsed.matches || [])
      .filter((item) => allowed.has(Number(item.projectId)) && item.score >= 0.35)
      .map((item) => ({
        projectId: Number(item.projectId),
        score: Number(item.score),
        reason: item.reason,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    return {
      extracted: {
        domain: parsed.extracted?.domain || "",
        skills: parsed.extracted?.skills || [],
        deliverables: parsed.extracted?.deliverables || [],
        platforms: parsed.extracted?.platforms || [],
      },
      matches,
      usedFallback: false,
      model: MATCH_MODEL,
    };
  } catch (error) {
    const fallback = fallbackMatch(jobDescription, projects);
    return {
      ...fallback,
      fallbackReason:
        error instanceof Error ? error.message : "OpenAI request failed",
    };
  }
}
