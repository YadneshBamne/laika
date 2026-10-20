// The site itself is static HTML in /public (see next.config.ts rewrites); this layout only satisfies the app router.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
