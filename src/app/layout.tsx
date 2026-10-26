import "./globals.css";
export const metadata = { title: "Ari — your assistant, your way" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
