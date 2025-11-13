import React, { useMemo, useState, useEffect } from 'react';
import { FaSave } from 'react-icons/fa';
import { useLanguage, content } from '../../../context/LanguageContext';

const STATUS_OPTIONS = ['published', 'draft', 'archived'];

export const PublishBox = ({ status, onSave }) => {
  const { language } = useLanguage();
  const t = content[language];

  const options = useMemo(() => STATUS_OPTIONS, []);
  const [selectedStatus, setSelectedStatus] = useState(status || options[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (event) => {
    setSelectedStatus(event.target.value);
    setFeedback(null);
  };

  const handleSave = async () => {
    if (!onSave) return;
    try {
      setIsSaving(true);
      await onSave(selectedStatus);
      setFeedback({ type: 'success', message: t?.assetOrderDetail?.publishBox?.saveSuccess || 'Status updated.' });
    } catch (error) {
      setFeedback({ type: 'error', message: t?.assetOrderDetail?.publishBox?.saveError || 'Failed to update status.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-dismiss feedback after 5 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  return (
    <div className="shadow-md rounded-2xl text-[var(--brand-text)] bg-[var(--brand-navbar)] p-5 w-full flex flex-col">
      <h2 className="text-sm font-semibold text-[var(--brand-text-secondary)]">
        {t?.assetOrderDetail?.publishBox?.title || 'Publish status'}
      </h2>
      <label className="flex flex-col gap-2 mb-4">
        <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3">
          <select
            value={selectedStatus}
            onChange={handleChange}
            className="w-full bg-transparent text-base font-semibold text-[var(--brand-text)] outline-none"
            aria-label={t?.assetOrderDetail?.publishBox?.label || 'Status'}
          >
            {options.map((option) => (
              <option key={option} value={option} className="text-[var(--brand-text)]">
                {t?.assetOrderDetail?.publishBox?.options?.[option] || option}
              </option>
            ))}
          </select>
        </div>
      </label>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center justify-center gap-2 rounded-xl text-[#9333EA] bg-[rgba(143,64,212,0.15)] px-4 py-3 text-base font-semibold shadow-inner disabled:opacity-60"
      >
        <FaSave className="text-base" />
        {isSaving
          ? t?.assetOrderDetail?.publishBox?.saving || 'Saving…'
          : t?.assetOrderDetail?.publishBox?.button || 'Save changes'}
      </button>

      {feedback && (
        <p
          className={`text-sm ${
            feedback.type === 'success' ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
};

export default PublishBox;
