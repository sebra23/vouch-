// Netlify scheduled function — auto-inbox triage every 20 minutes
export default async () => {
  const base = process.env.URL ?? "";
  await fetch(`${base}/api/routines/run?key=auto-inbox&secret=${process.env.CRON_SECRET}`).catch(() => {});
  return new Response("auto-inbox triggered");
};

export const config = { schedule: "*/20 * * * *" };
