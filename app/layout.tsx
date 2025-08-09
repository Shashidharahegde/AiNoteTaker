import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import Header from "./components/Header";


export const metadata: Metadata = {
  title: "notty",
  description: "Ai-powered note-taking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen w-full flex-col" >
          <Header />
        <main className="flex flex-1">
          {children}
        </main>
        </div>
      </body>
    </html>
  );
}
