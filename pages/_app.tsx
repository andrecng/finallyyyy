import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div style={{ fontFamily: "system-ui,-apple-system,Segoe UI,Roboto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <strong>MM Engine</strong>
        <nav style={{ display: "flex", gap: 12 }}>
          <a href="/">Home</a>
          <a href="/strategy-t">Strategy</a>
        </nav>
      </header>
      <Component {...pageProps} />
    </div>
  );
}
