import React, { useState, useEffect } from 'react';
import { Mail, Phone, Trash2 } from 'lucide-react';

export const Sidebox = ({
	t = {},
	contacts = [],
	purchasesValue = '0.8 MSEK',
	compensationValue = '125 tons',
	maxContactDetails = 3,
	clientId = 'defaultClient', // optional identifier to scope notes
}) => {
	const [notes, setNotes] = useState([]);
	const [noteText, setNoteText] = useState('');

	// Load notes from localStorage for persistence (scoped by clientId)
	useEffect(() => {
		try {
			const stored = localStorage.getItem(`clientNotes:${clientId}`);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed)) setNotes(parsed);
			}
		} catch {/* ignore parse errors */}
	}, [clientId]);

	const handleAddNote = () => {
		const trimmed = noteText.trim();
		if (!trimmed) return;
		const newNote = {
			id: Date.now(),
			text: trimmed,
			createdAt: new Date().toISOString(),
		};
		const updated = [newNote, ...notes];
		setNotes(updated);
		setNoteText('');
		try {
			localStorage.setItem(`clientNotes:${clientId}`, JSON.stringify(updated));
		} catch {/* ignore storage errors */}
	};

	const handleDeleteNote = (id) => {
		const updated = notes.filter(n => n.id !== id);
		setNotes(updated);
		try {
			localStorage.setItem(`clientNotes:${clientId}`, JSON.stringify(updated));
		} catch {/* ignore storage errors */}
	};

	const formatDate = (iso) => {
		try {
			const d = new Date(iso);
			return d.toLocaleString(undefined, {
				year: 'numeric', month: 'short', day: '2-digit',
				hour: '2-digit', minute: '2-digit'
			});
		} catch { return iso; }
	};

	return (
  <div className="col-start-4 col-end-5 flex flex-col gap-5">
	{/* Purchases Card */}
	<div className="bg-[var(--brand-navbar)] border border-[var(--brand-border)] rounded-lg p-5 mb-2 w-full">
  	  <div className="text-l mb-2 text-[var(--brand-text-secondary)]">
		{t?.clientOverview?.totalPurchases || 'Total purchases'}
	  </div>
	  <div className="text-3xl font-bold text-[var(--brand-text)]">{purchasesValue}</div>
	  </div>
		{/* Compensation Card */}
		<div className="bg-[var(--brand-navbar)] border border-[var(--brand-border)] rounded-lg p-5 mb-2 w-full">
		  <div className="text-l mb-2 text-[var(--brand-text-secondary)]">
			{t?.clientOverview?.totalCompensation || 'Total compensation'}
		  </div>
  		  <div className="text-3xl font-bold text-[var(--brand-text)]">{compensationValue}</div>
		</div>
		{/* Contacts Card */}
		<div className="bg-[var(--brand-navbar)] border border-[var(--brand-border)] rounded-lg p-5 w-full">
		  <div className="font-bold text-xl mb-3 text-[var(--brand-text)]">
			{t?.clientOverview?.contacts || 'Contacts'}
		  </div>
		  {contacts.map((c, idx) => (
			<div
		      key={idx}
			  className={`bg-[var(--brand-background)] mb-4 pb-5 pt-5 pl-5 rounded-md cursor-pointer hover:border hover:border-purple-500`}
			  onClick={() => alert(`Navigating to ${c.name}'s profile...`)}
			>
              <div className=" text-base font-bold text-[var(--brand-text)]">{c.name}</div>
                <div className="border-b mb-3 pb-3 border-[var(--brand-border)] text-sm text-[var(--brand-text-secondary)] mb-1">{c.role}</div>
                    {idx < maxContactDetails && (
                    <>
						{c.email && (
							<div className="border-b mb-3 pb-3 border-[var(--brand-border)] flex items-center gap-2 text-sm text-[var(--brand-text-secondary)]">
								<Mail className="text-[var(--brand-text)]" /> {c.email}
							</div>
						)}
						{c.phone && (
							<div className="flex items-center gap-2 text-sm text-[var(--brand-text-secondary)]">
				    			<Phone className="text-[var(--brand-text)]" /> {c.phone}
							</div>
						)}
					</>
				)}
			</div>
		  ))}
		</div>
        {/* Private Notes Section */}
		<div className="bg-[var(--brand-navbar)] border border-[var(--brand-border)] rounded-lg p-5 mb-2 w-full">
			<div className="font-semibold text-lg mb-3 text-[var(--brand-text)]">
				{t?.sidebox?.privateNotesTitle || 'Private notes'}
			</div>
			<div className="flex flex-col gap-3">
				<textarea
					value={noteText}
					onChange={(e) => setNoteText(e.target.value)}
					placeholder={t?.sidebox?.addNotePlaceholder || 'Enter note...'}
					className="w-full h-24 resize-y rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] p-2 text-sm text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-purple-500/40"
				/>
				<button
		    		onClick={handleAddNote}
					disabled={!noteText.trim()}
					className="self-end px-4 py-2 rounded-md font-medium text-sm bg-aprovedPurple/20 text-neuroPurpleDark hover:bg-aprovedPurple/30 disabled:opacity-40 disabled:cursor-not-allowed"
				>
					{t?.sidebox?.addNoteButton || 'Add note'}
				</button>
			</div>
			<div className="mt-4 flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
			{notes.length === 0 && (
				<div className="text-xs text-[var(--brand-text-secondary)] italic">
					{t?.sidebox?.noNotes || 'No notes added yet.'}
				</div>
				)}
			    {notes.map(n => (
					<div key={n.id} className="rounded-md p-3 bg-[var(--brand-background)] border border-[var(--brand-border)] shadow-sm relative group">
						<button
							onClick={() => handleDeleteNote(n.id)}
							className="absolute top-1 right-1 p-1"
							aria-label="Delete note"
						>
							<Trash2 className="w-4 h-4 text-red-500 opacity-70 group-hover:opacity-100" />
						</button>
						<div className="text-[var(--brand-text-secondary)] text-[10px] mb-1 pr-5 uppercase tracking-wide">
							{formatDate(n.createdAt)}
						</div>
						<div className="text-sm text-[var(--brand-text)] whitespace-pre-wrap pr-5">{n.text}</div>
					</div>
				))}
			</div>
		</div>
	</div>
  );
};

export default Sidebox;
