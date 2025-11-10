import { useLanguage } from '../../../context/LanguageContext.jsx';

export const EditBox = () => {
  const { language, content } = useLanguage();
  const t = content?.[language]?.editBox || {};
  return (
    <div
      className="rounded-2xl border p-4 w-full max-w-sm mt-2 font-sans flex flex-col gap-3"
      style={{
        background: 'var(--brand-navbar)',
        borderColor: 'var(--brand-border)',
      }}
    >
      <button className="w-full rounded-xl py-3 font-semibold shadow-sm transition-colors bg-aprovedPurple/15 text-neuroPurpleDark hover:bg-aprovedPurple/30">
        {t.editOrder || 'Edit order'}
      </button>
      <button className="w-full rounded-xl py-3 font-semibold shadow-sm transition-colors bg-obsoletedRed/20 text-obsoletedRed hover:bg-obsoletedRed/50">
        {t.issueRefund || 'Issue refund'}
      </button>
    </div>
  );
};

