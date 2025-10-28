import "./globals.css";

export const metadata = {
  title: "Firefighter: Inferno Run",
  description: "Fast 2D firefighting survival prototype built with Next.js"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-black text-white">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
