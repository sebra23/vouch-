// Netlify scheduled function — loose-ends sweep, weekdays 16:30
export default async () => {
  const base = process.env.URL ?? "";
  await fetch(`${base}/api/routines/run?key=loose-ends&secret=${process.env.CRON_SECRET}`).catch(() => {});
  return new Response("loose-ends triggered");
};

export const config = { schedule: "30 16 * * 1-5" };
