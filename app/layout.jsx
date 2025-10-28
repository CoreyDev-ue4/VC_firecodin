import "./globals.css";

export const metadata = {
  title: "Firefighter: Inferno Run",
  description: "Endless firefighting survival experience built with Next.js and Three.js"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-black text-white">
      <body>{children}</body>
    </html>
  );
}
