import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <p className="site-footer-eyebrow">Veluws Verleden</p>
          <p className="site-footer-title">Vensters Veluws Verleden</p>
          <p className="site-footer-description">
            Ontdek de verhalen en geschiedenis van de Veluwe.
          </p>
        </div>

        <nav className="site-footer-nav" aria-label="Footernavigatie">
          <Link href="/">Home</Link>
        </nav>
      </div>
    </footer>
  );
}
