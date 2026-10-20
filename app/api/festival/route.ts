import { connection } from "next/server";

// Google's public Indian holiday calendar: updated by Google every year, so no dates are kept in this repo.
const ICS = "https://calendar.google.com/calendar/ical/en.indian%23holiday%40group.v.calendar.google.com/public/basic.ics";

// first match wins: [name pattern, strip background, strip text]; every pair is at least 4.5:1
const TONES: [RegExp, string, string][] = [
  [/diwali|deepavali|dhanteras|lakshmi|naraka/i, "#f2a900", "#2b1200"],
  [/holi|holika|dhulandi/i, "#b3125a", "#ffffff"],
  [/independence|republic/i, "linear-gradient(90deg,#ff9933 0%,#ffffff 50%,#138808 100%)", "#0b1f4d"],
  [/eid|id-ul|ramzan|ramadan|muharram|milad|shab/i, "#0b6b3a", "#ffffff"],
  [/christmas|easter/i, "#a31621", "#ffffff"],
  [/guru|nanak|gobind|baisakhi|vaisakhi|sikh/i, "#1c4fa0", "#ffffff"],
  [/raksha|rakhi|bhai duj|karva|karaka/i, "#9c1f6b", "#ffffff"],
  [/sankranti|pongal|onam|ugadi|gudi|bihu|vishu|navroz|nowruz/i, "#7a5200", "#ffffff"],
  [/buddha|mahavir|jain|paryushan/i, "#6b5600", "#ffffff"],
  [/ganesh|vinayaka|chaturthi/i, "#a8380c", "#ffffff"],
  [/gandhi|ambedkar|jayanti/i, "#2f3a46", "#ffffff"],
  [/good friday|martyr|ashura|memorial/i, "#222222", "#ffffff"],
];
const SOLEMN = /good friday|martyr|ashura|memorial/i;

export async function GET() {
  await connection();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()).replaceAll("-", "");
  const res = await fetch(ICS, { next: { revalidate: 86400 } }).catch(() => null);
  if (!res?.ok) return Response.json(null);
  const events = (await res.text()).replace(/\r?\n[ \t]/g, "").split("BEGIN:VEVENT").slice(1);
  const todays = events
    .filter((e) => e.includes(`DTSTART;VALUE=DATE:${today}`))
    .map((e) => ({
      name: /SUMMARY:(.*)/.exec(e)?.[1].trim().replace(/\,/g, ",").replace(/^First Day of /, "").replace("/", " / ") ?? "",
      holiday: e.includes("Public holiday"),
    }))
    .filter((e) => e.name);
  const pick = todays.find((e) => e.holiday) ?? todays[0];
  if (!pick) return Response.json(null);
  const [, bg, fg] = TONES.find(([re]) => re.test(pick.name)) ?? [0, "#b8430a", "#ffffff"];
  const message = SOLEMN.test(pick.name)
    ? `Today is ${pick.name}. — AKL Engineers and Contractors`
    : `Happy ${pick.name}! Warm wishes from AKL Engineers and Contractors.`;
  return Response.json({ name: pick.name, message, bg, fg }, { headers: { "Cache-Control": "public, max-age=1800" } });
}
