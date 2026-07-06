import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Admin Panel",
};

// Admin gets its own layout — no portfolio navbar/footer/background
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen" style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
