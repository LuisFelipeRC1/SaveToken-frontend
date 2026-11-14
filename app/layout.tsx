import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaveToken — Converta PDF em Markdown",
  description: "Converta seus PDFs em Markdown pronto para a era da IA.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
