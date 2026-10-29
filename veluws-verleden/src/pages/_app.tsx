import type { AppProps } from "next/app";
import { Footer } from "../components";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="app-layout">
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}
