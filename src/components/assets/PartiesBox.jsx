import { Building2 } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export const PartiesBox = () => {
  const { language, content } = useLanguage();
  const t = content?.[language]?.partiesBox || {};
  return (
    <div
      className="rounded-2xl border p-4 w-full max-w-sm mt-2 font-sans"
      style={{
        background: 'var(--brand-navbar)',
        color: 'var(--brand-text)',
        borderColor: 'var(--brand-border)',
      }}
    >
      <div className="flex flex-col gap-3">
        {/* EcoTech Solutions */}
        <div
          className="flex items-center gap-2 rounded-xl p-4 flex-row"
          style={{ background: 'var(--brand-background)' }}
        >
          <span>
            <Image
              src="/EuroTechLogo.svg"
              alt="Company Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </span>
          <div className="flex flex-col flex-1">
            <span className="font-semibold" style={{ color: 'var(--brand-text)' }}>
              EcoTech Solutions
            </span>
            <span className="flex items-center text-sm mt-1 gap-1" style={{ color: 'var(--brand-text)' }}>
              <Building2 className="text-[var(--brand-text)] h-4 w-4" />
              {t.buyer || 'Buyer'}
            </span>
          </div>
        </div>
        {/* Creturner */}
        <div
          className="flex items-center gap-2 rounded-xl p-4"
          style={{ background: 'var(--brand-background)' }}
        >
          <span>
            <Image
              src="/CreturnerLogo.svg"
              alt="Company Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </span>
          <div className="flex flex-col flex-1">
            <span className="font-semibold" style={{ color: 'var(--brand-text)' }}>
              Creturner
            </span>
            <span className="flex items-center text-sm mt-1 gap-1" style={{ color: 'var(--brand-text)' }}>
              <Building2 className="text-[var(--brand-text)] h-4 w-4" />
              {t.issuer || 'Issuer'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
