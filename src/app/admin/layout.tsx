import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel — Warung Nusantara",
  robots: "noindex, nofollow", // Prevent indexing
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {children}
    </div>
  )
}
