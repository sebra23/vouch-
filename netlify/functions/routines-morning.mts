// Netlify scheduled function — morning batch: briefing + meeting prep
export default async () => {
  const base = process.env.URL ?? "";
  for (const key of ["morning-briefing", "meeting-briefing"])
    await fetch(`${base}/api/routines/run?key=${key}&secret=${process.env.CRON_SECRET}`).catch(() => {});
  return new Response("morning routines triggered");
};

export const config = { schedule: "0 6 * * *" };
