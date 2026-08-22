export const engagementBeats = [
  {
    key: "theAsk",
    id: "the-ask",
    title: "The ask",
    kicker: "What they hired me to do",
    adminLabel: "The ask",
    adminHint: "Their words — the job post, the kickoff, what they thought they needed. Not a résumé headline.",
  },
  {
    key: "walkedInto",
    id: "walked-into",
    title: "What I walked into",
    kicker: "The messy room on day one",
    adminLabel: "What I walked into",
    adminHint: "First week on the ground: the repo, the spreadsheet, the Slack thread that was actually the product.",
  },
  {
    key: "theBuild",
    id: "the-build",
    title: "How I worked it",
    kicker: "Calls I made with them in the room",
    adminLabel: "How I worked it",
    adminHint: "Hands-on: decisions, tradeoffs, what you actually shipped. Write it like a field note, not a task list.",
  },
  {
    key: "inTheirHands",
    id: "in-their-hands",
    title: "What they run now",
    kicker: "Monday morning, after I left",
    adminLabel: "What they run now",
    adminHint: "What they open every week. Proof, handoff, who owns it. Not 'we delivered a solution.'",
  },
] as const;

export type EngagementField = (typeof engagementBeats)[number]["key"];
