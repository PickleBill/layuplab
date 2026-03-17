import { Smartphone } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="py-16 bg-background border-t border-border">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Smartphone className="text-primary" size={24} />
            <p className="font-display font-bold text-foreground text-lg">
              No Tripod Required
            </p>
          </div>
          <p className="font-body text-muted-foreground">
            Optimized for fence-mount and ground-leaning. Just prop your phone and train.
          </p>

          {/* App Store Badges */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-[4px] border border-surface-border bg-card px-5 py-3 hover:border-primary/30 transition-colors duration-200"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-foreground">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.56 2.93 11.3 4.7 7.72C5.57 5.94 7.36 4.86 9.28 4.84C10.56 4.81 11.78 5.72 12.57 5.72C13.36 5.72 14.85 4.62 16.4 4.8C17.04 4.83 18.87 5.08 20.07 6.84C19.97 6.9 17.64 8.27 17.67 11.11C17.71 14.51 20.62 15.62 20.66 15.63C20.62 15.74 20.14 17.4 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
              </svg>
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground font-body leading-none">Download on the</p>
                <p className="font-display font-bold text-foreground text-sm leading-tight">App Store</p>
              </div>
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-[4px] border border-surface-border bg-card px-5 py-3 hover:border-primary/30 transition-colors duration-200"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-foreground">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.04l2.593 1.5a1 1 0 010 1.666l-2.593 1.5-2.537-2.537 2.537-2.13zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
              </svg>
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground font-body leading-none">Get it on</p>
                <p className="font-display font-bold text-foreground text-sm leading-tight">Google Play</p>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display font-extrabold text-lg tracking-tight text-foreground">
            LAYUP<span className="text-primary">LAB</span>
          </p>
          <p className="font-body text-muted-foreground text-sm">
            © {new Date().getFullYear()} Layup Lab Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
