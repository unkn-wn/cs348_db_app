import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";

import Sidebar from "./_components/sidebar";

export const metadata: Metadata = {
  title: "Event Planner",
  description: "CS348 Event Planner App",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="flex flex-rows bg-white text-gray-800 w-full justify-center my-8">
        <Sidebar />
        <div className="w-3/4">
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </div>
      </body>
    </html>
  );
}
