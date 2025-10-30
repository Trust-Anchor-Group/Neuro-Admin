import React, { useState } from "react";

const pricingAgreements = [
  { title: 'Carbon capture EU (Q2 2025)', date: 'Apr 15, 2025', price: '250,000 SEK', status: 'Active' },
  { title: 'Renewable Energy Purchase (2025)', date: 'Jan 10, 2025', price: '120,000 SEK', status: 'Active' },
  { title: 'Offset Credits (2024)', date: 'Dec 1, 2024', price: '80,000 SEK', status: 'Active' },
];
const contacts = [
  { name: 'Alexander Ozaeta Arce', role: 'CEO', email: 'alexander@trustanchorgroup.com', phone: '+46 70 123 4567' },
  { name: 'Maria Svensson', role: 'CFO', email: 'maria@trustanchorgroup.com', phone: '+46 70 987 6543' },
  { name: 'Johan Lindberg', role: 'CTO', email: 'johan@trustanchorgroup.com', phone: '+46 70 555 1234' },
  { name: 'Sara Nilsson', role: 'Legal Advisor' },
  { name: 'Erik Johansson', role: 'Sustainability Lead' },
];

const Overview = () => {
  const [showModal, setShowModal] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [agreementPage, setAgreementPage] = useState(1);
  const agreementsPerPage = 4;
  const [agreementModal, setAgreementModal] = useState({ open: false, agreement: null });
  const [editProposalModal, setEditProposalModal] = useState({ open: false, agreement: null });
  const [createAgreementModal, setCreateAgreementModal] = useState(false);
  const [clientIcon, setClientIcon] = useState('🏢');
  const [clientIconDark, setClientIconDark] = useState('🌑');
  const [clientName, setClientName] = useState('EcoTech Solutions');
  const [industry, setIndustry] = useState('Technology');
  const [regNumber, setRegNumber] = useState('556677-8899');
  const [address, setAddress] = useState('456 Oak Ave, CA 94102, San Francisco, USA');

  return (
    <>
  <div className="grid grid-cols-4 gap-5 p-5">
      {/* Left column: main content (3/4) */}
  <div className=" bg-[var(--brand-background)] col-span-3 flex flex-col gap-5">
    {/* Client Info Card - unified */}
    <div
      className="rounded-2xl shadow-lg p-8 border cursor-pointer text-base"
      style={{
        minHeight: '260px',
        color: 'var(--brand-text)',
        background: 'var(--brand-navbar)',
        borderColor: 'var(--brand-border)',
      }}
      onClick={() => setShowInfoPopup(true)}
    >
      {/* Header Section */}
      <div className="relative mb-6">
        <div className="flex items-center gap-7 pt-2">
          <span className="inline-flex items-center justify-center rounded-full bg-white  border border-[var(--brand-border)] w-24 h-24 p-2 shadow absolute left-0 top-2" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', zIndex: 2 }}>
            <span role="img" aria-label="building" className="w-16 h-16 text-green-600">🏢</span>
          </span>
          <div className="ml-28">
            <div className="font-bold text-2xl  text-[var(--brand-text)]">EcoTech Solutions</div>
            <div className="text-base text-gray-400 text-[var(--brand-text-secondary)]">Client since Feb 23, 2025, 15:29</div>
          </div>
        </div>
        <div className="border-t border-gray-200 border-[var(--brand-border)] absolute left-28 right-0 top-20" />
      </div>
      {/* Company Information Section */}
      <div className="bg-[var(--brand-background)] rounded-xl p-5 mb-4">
        <div className="font-medium text-gray-600 text-[var(--brand-text-secondary)] mb-4">Company Information</div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 items-center border-b-2 border-[var(--brand-border)] bg-[var(--brand-background)] animate-fade-in">
            <span className="text-sm text-[var(--brand-text-secondary)] my-2">Reg. Number</span>
            <span className="text-base font-semibold text-[var(--brand-text-primary)] text-center my-2">556677-8899</span>
            <span></span>
          </div>
          <div className="grid grid-cols-3 items-center border-b-2 border-[var(--brand-border)] bg-[var(--brand-background)] animate-fade-in">
            <span className="text-sm text-[var(--brand-text-secondary)]  my-2">Industry</span>
            <span className="text-base font-semibold text-[var(--brand-text-primary)]  text-center my-2">Technology</span>
            <span></span>
          </div>
          <div className="grid grid-cols-3 items-center border-b-2 border-[var(--brand-border)] bg-[var(--brand-background)] animate-fade-in">
            <span className="text-sm text-[var(--brand-text-secondary)]  my-2">Location</span>
            <span className="flex flex-col items-center justify-center my-2">
              <span className="text-base font-semibold text-[var(--brand-text-primary)] text-center">San Francisco, USA</span>
              <span className="text-xs text-[var(--brand-text-secondary)]  text-center">456 Oak Ave, CA 94102</span>
            </span>
            <span></span>
          </div>
        </div>
      </div>
      {/* Billing Info Section */}
      <div className="bg-[var(--brand-background)] rounded-xl p-4 mb-3 flex  items-center">
        <span className="w-1/3 font-medium text-[var(--brand-text-secondary)] text-left flex items-center">Billing info</span>
        <span className="w-1/3 flex justify-center items-center">
          <span className="font-semibold text-[var(--brand-text-primary)]  text-center">billing@ecotech.com</span>
        </span>
        <span className="w-1/3" />
      </div>
      {/* Client ID Section */}
      <div className="bg-[var(--brand-background)] rounded-xl p-4 mb-6 flex items-center">
        <span className="w-1/3 font-medium text-[var(--brand-text-secondary)] text-left flex items-center">Client ID</span>
        <span className="w-1/3 flex justify-center items-center">
          <span className="font-semibold text-[var(--brand-text-primary)] text-center">EcoTech_Solutions</span>
        </span>
        <span className="w-1/3 flex justify-end items-center">
          <span className="px-3 py-1 rounded-full bg-green-100  text-green-700  text-xs font-semibold">Active</span>
        </span>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <button
          className="bg-purple-100 text-purple-700 px-5 py-2 rounded-xl font-semibold hover:bg-purple-200 shadow-sm"
          onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
        >
          Edit Information
        </button>
        <button className="bg-purple-100 text-purple-700 px-5 py-2 rounded-xl font-semibold hover:bg-purple-200 shadow-sm" onClick={e => e.stopPropagation()}>
          Manage Client ID
        </button>
      </div>
    </div>
        {/* Pricing Agreements Section */}
        <div>
          <div className="font-semibold text-xl mb-3 text-[var(--brand-text)]">Pricing agreements</div>
          <div className="bg-[var(--brand-navbar)] rounded-lg shadow-md p-5 border border-[var(--brand-border)]">
            <div className="flex justify-between items-center mb-4">
              <input type="text" placeholder="Search agreements..." className="border border-[var(--brand-border)] rounded-xl px-3 py-2 text-sm w-1/2 bg-[var(--brand-navbar)] text-[var(--brand-text)]" />
              <select className="border border-[var(--brand-border)] rounded-xl px-3 py-2 text-sm bg-[var(--brand-navbar)] text-[var(--brand-text)]">
                <option>All</option>
                <option>Active</option>
                <option>Expired</option>
              </select>
            </div>
            <div className="space-y-4">
              {pricingAgreements
                .slice((agreementPage - 1) * agreementsPerPage, agreementPage * agreementsPerPage)
                .map((agreement, idx) => (
                  <div
                    key={idx + (agreementPage - 1) * agreementsPerPage}
                    className="bg-[var(--brand-navbar)] rounded-xl shadow-sm p-4 flex justify-between items-center cursor-pointer hover:bg-purple-50 border border-[var(--brand-border)]"
                    onClick={() => setAgreementModal({ open: true, agreement })}
                  >
                    <div>
                      <div className="font-semibold text-[var(--brand-text)]">{agreement.title}</div>
                      <div className="text-xs text-[var(--brand-text-secondary)]">{agreement.date} • {agreement.price}</div>
                    </div>
                    <span className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-sm font-medium border border-[var(--brand-border)]">{agreement.status}</span>
                  </div>
                ))}
            </div>
            <div className="flex gap-2 mt-6 justify-end">
              {[...Array(Math.ceil(pricingAgreements.length / agreementsPerPage)).keys()].map(i => (
                <button
                  key={i}
                  className={`rounded-full px-3 py-1 bg-[var(--brand-navbar)] text-purple-900 font-medium border border-[var(--brand-border)] ${agreementPage === i + 1 ? 'bg-purple-200' : ''}`}
                  onClick={() => setAgreementPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
      {/* Modal Popup for Company Info Card */}
      {showInfoPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="dialog" aria-modal="true" aria-label="Company info popup">
          <section className="bg-[var(--brand-navbar)] p-10 rounded-lg shadow-lg w-[650px] max-h-[90vh] overflow-y-auto border-2 border-[var(--brand-border)] relative text-base" style={{ minHeight: '340px' }}>
            <header className="flex justify-between items-center bg-[var(--brand-navbar)] border-b-2 border-[var(--brand-border)] pb-3 mb-4 rounded-t-lg">
              <h2 className="text-xl font-semibold text-[var(--brand-text-color)]">Company Information</h2>
              <button className="text-gray-500 hover:text-gray-700 border border-[var(--brand-border)] rounded-full px-2 py-1 ml-2" onClick={() => setShowInfoPopup(false)} aria-label="Close">&times;</button>
            </header>
            <div className="flex items-center gap-4 mb-2">
              <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-600 w-14 h-14 border border-[var(--brand-border)]">
                <span role="img" aria-label="building" className="w-8 h-8">🏢</span>
              </span>
              <div>
                <div className="font-semibold text-xl mb-1 text-[var(--brand-text)]">EcoTech Solutions</div>
                <div className="text-base text-[var(--brand-text-secondary)]">Client since Feb 23, 2025, 15:29</div>
              </div>
            </div>
            <div className="border-t border-[var(--brand-border)] mt-4 mb-4" />
            <div className="grid grid-cols-2 gap-x-8">
              <div className="space-y-2">
                <div className="py-2 border-b border-[var(--brand-border)] flex justify-between">
                  <span className="text-[var(--brand-text-secondary)] font-medium text-sm">Reg. Number</span>
                  <span className="text-[var(--brand-text)] font-semibold">556677-8899</span>
                </div>
                <div className="py-2 border-b border-[var(--brand-border)] flex justify-between">
                  <span className="text-[var(--brand-text-secondary)] font-medium text-sm">Industry</span>
                  <span className="text-[var(--brand-text)] font-semibold">Technology</span>
                </div>
                <div className="py-2 border-b border-[var(--brand-border)] flex flex-col">
                  <span className="text-[var(--brand-text-secondary)] font-medium text-sm">Location</span>
                  <span className="text-[var(--brand-text)] font-semibold">San Francisco, USA</span>
                  <span className="text-[var(--brand-text-secondary)] text-xs">456 Oak Ave, CA 94102</span>
                </div>
                <div className="py-2 border-b border-[var(--brand-border)] flex justify-between">
                  <span className="text-[var(--brand-text-secondary)] font-medium text-sm">Billing info</span>
                  <span className="text-[var(--brand-text)] font-semibold">billing@ecotech.com</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-[var(--brand-text-secondary)] font-medium text-sm">Client ID</span>
                  <span className="text-[var(--brand-text)] font-semibold">EcoTech_Solutions</span>
                </div>
              </div>
            </div>
            <div className="border-t border-[var(--brand-border)] mt-6 pt-4 flex gap-3 justify-end">
              <button
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-200 shadow-sm"
                onClick={() => { setShowInfoPopup(false); setShowModal(true); }}
              >
                Edit Information
              </button>
              <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-200 shadow-sm inline-flex items-center gap-2">🔑 Manage Client ID</button>
            </div>
          </section>
        </div>
      )}
            <div className="flex justify-end mt-4">
              <button
                className="bg-purple-100 text-purple-700 px-5 py-2 rounded-xl font-medium hover:bg-purple-200"
                onClick={() => setCreateAgreementModal(true)}
              >
                Create New Agreement
              </button>
            </div>
        {/* Modal Popup for Create Agreement */}
        {createAgreementModal && (
          <EditProposalModal
            agreement={null}
            onClose={() => setCreateAgreementModal(false)}
            onSave={(updated) => {
              setCreateAgreementModal(false);
              // Optionally add agreement to state here
            }}
            createMode={true}
          />
        )}
          </div>
        </div>
      </div>
      {/* Right column: sidebar (1/4) */}
      <div className="col-start-4 col-end-5 flex flex-col gap-5">
        {/* Purchases Card */}
        <div className="bg-[var(--brand-navbar)] border-2 border-[var(--brand-border)] rounded-lg p-5 mb-2 w-full">
          <div className="font-semibold text-xl mb-2 text-[var(--brand-text)]">Total purchases</div>
          <div className="text-2xl font-bold text-[var(--brand-text)]">0.8 MSEK</div>
        </div>
        {/* Compensation Card */}
        <div className="bg-[var(--brand-navbar)] border-2 border-[var(--brand-border)] rounded-lg p-5 mb-2 w-full">
          <div className="font-semibold text-xl mb-2 text-[var(--brand-text)]">Total compensation</div>
          <div className="text-2xl font-bold text-[var(--brand-text)]">125 tons</div>
        </div>
        {/* Contacts Card */}
        <div className="bg-[var(--brand-navbar)] border-2 border-[var(--brand-border)] rounded-lg p-5 w-full">
          <div className="font-semibold text-xl mb-3 text-[var(--brand-text)]">Contacts</div>
          {contacts.map((c, idx) => (
            <div
              key={idx}
              className={`mb-4 pb-4 cursor-pointer ${idx < contacts.length - 1 ? 'border-b border-[var(--brand-border)]' : ''}`}
              onClick={() => alert(`Navigating to ${c.name}'s profile...`)}
            >
              <div className="text-base font-bold text-[var(--brand-text)]">{c.name}</div>
              <div className="text-sm text-[var(--brand-text-secondary)] mb-1">{c.role}</div>
              {idx < 3 && (
                <>
                  <div className="flex items-center gap-2 text-sm text-[var(--brand-text-secondary)]">
                    <span role="img" aria-label="email">📧</span> {c.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--brand-text-secondary)]">
                    <span role="img" aria-label="phone">📞</span> {c.phone}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>
      {/* Modal Popup for Editing Client Info */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="dialog" aria-modal="true" aria-label="Edit client modal">
          <section className="bg-[var(--brand-navbar)] p-6 rounded-lg shadow-lg w-[512px] max-h-[90vh] overflow-y-auto border-2 border-[var(--brand-border)] relative">
            <header className="flex justify-between items-center bg-[var(--brand-navbar)] border-b-2 border-[var(--brand-border)] pb-3 mb-4 rounded-t-lg">
              <h2 className="text-xl font-semibold text-[var(--brand-text-color)]">Edit Client Information</h2>
              <button className="text-gray-500 hover:text-gray-700 border border-[var(--brand-border)] rounded-full px-2 py-1 ml-2" onClick={() => setShowModal(false)} aria-label="Close">&times;</button>
            </header>
            <div className="flex gap-4 mb-4 items-center">
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-600 w-14 h-14 text-3xl mb-2 border border-[var(--brand-border)]">{clientIcon}</span>
                <button className="text-xs text-red-500" onClick={() => setClientIcon('')}>Remove</button>
                <button className="text-xs text-blue-500 mt-1" onClick={() => setClientIcon(prompt('Enter new icon (emoji):', clientIcon) || clientIcon)}>Change</button>
              </div>
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center justify-center rounded-full bg-gray-800 text-white w-14 h-14 text-3xl mb-2 border border-[var(--brand-border)]">{clientIconDark}</span>
                <button className="text-xs text-red-500" onClick={() => setClientIconDark('')}>Remove</button>
                <button className="text-xs text-blue-500 mt-1" onClick={() => setClientIconDark(prompt('Enter new dark mode icon (emoji):', clientIconDark) || clientIconDark)}>Change</button>
              </div>
              <button className="text-xs text-purple-500 ml-2" onClick={() => setClientIconDark('🌑')}>Add Dark Mode Icon</button>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-[var(--brand-text-secondary)]">Client Name</label>
              <input type="text" className="w-full border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-navbar)] text-[var(--brand-text)]" value={clientName} onChange={e => setClientName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-[var(--brand-text-secondary)]">Industry</label>
              <input type="text" className="w-full border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-navbar)] text-[var(--brand-text)]" value={industry} onChange={e => setIndustry(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-[var(--brand-text-secondary)]">Reg. Number</label>
              <input type="text" className="w-full border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-navbar)] text-[var(--brand-text)]" value={regNumber} onChange={e => setRegNumber(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-[var(--brand-text-secondary)]">Address</label>
              <input type="text" className="w-full border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-navbar)] text-[var(--brand-text)]" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="flex gap-4 mt-6 justify-end">
              <button
                className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-medium hover:bg-red-200"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-medium hover:bg-purple-200"
                onClick={() => setShowModal(false)}
              >
                Save Changes
              </button>
            </div>
            {/* ...existing modal content... */}
          </section>
        </div>
      )}
        {/* Modal Popup for Pricing Agreement Details */}
        {agreementModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="dialog" aria-modal="true" aria-label="Agreement details modal">
            <section className="bg-[var(--brand-navbar)] p-6 rounded-lg shadow-lg w-[512px] max-h-[90vh] overflow-y-auto border-2 border-[var(--brand-border)] relative">
              <header className="flex justify-between items-center bg-[var(--brand-navbar)] border-b-2 border-[var(--brand-border)] pb-3 mb-4 rounded-t-lg">
                <h2 className="text-xl font-semibold text-[var(--brand-text-color)]">{agreementModal.agreement?.title}</h2>
                <button className="text-gray-500 hover:text-gray-700 border border-[var(--brand-border)] rounded-full px-2 py-1 ml-2" onClick={() => setAgreementModal({ open: false, agreement: null })} aria-label="Close">&times;</button>
              </header>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-[var(--brand-text-secondary)]">Buyer:</span>
                    <span className="text-[var(--brand-text)]">EcoTech Solutions</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-[var(--brand-text-secondary)]">Seller:</span>
                    <span className="text-[var(--brand-text)]">Trust Anchor Group</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-[var(--brand-text-secondary)]">Price (per ton):</span>
                    <span className="text-[var(--brand-text)]">{agreementModal.agreement?.price || '-'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-[var(--brand-text-secondary)]">Expiry date:</span>
                    <span className="text-[var(--brand-text)]">{agreementModal.agreement?.date || '-'}</span>
                </div>
              </div>
              <div className="flex gap-4 mt-6 justify-end">
                <button
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-medium hover:bg-purple-200"
                  onClick={() => {
                    setEditProposalModal({ open: true, agreement: agreementModal.agreement });
                    setAgreementModal({ open: false, agreement: null });
                  }}
                >
                  Edit Proposal
                </button>
                <button
                  className="bg-red-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-800"
                  onClick={() => setAgreementModal({ open: false, agreement: null })}
                >
                  Deny
                </button>
                <button
                  className="bg-purple-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-800"
                  onClick={() => setAgreementModal({ open: false, agreement: null })}
                >
                  Approve
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Modal Popup for Edit Proposal */}
        {editProposalModal.open && (
          <EditProposalModal
            agreement={editProposalModal.agreement}
            onClose={() => setEditProposalModal({ open: false, agreement: null })}
            onSave={(updated) => {
              setEditProposalModal({ open: false, agreement: null });
              // Optionally update agreement in state here
            }}
          />
        )}
    </>
  );
};
// Edit Proposal Modal Component
function EditProposalModal({ agreement, onClose, onSave }) {
  const [name, setName] = useState(agreement?.title || '');
  const [price, setPrice] = useState(agreement?.price || '');
  const [expiry, setExpiry] = useState(agreement?.date || '');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="dialog" aria-modal="true" aria-label="Edit proposal modal">
      <section className="bg-[var(--brand-navbar)] p-6 rounded-lg shadow-lg w-[512px] max-h-[90vh] overflow-y-auto border-2 border-[var(--brand-border)] relative">
        <header className="flex justify-between items-center bg-[var(--brand-navbar)] border-b-2 border-[var(--brand-border)] pb-3 mb-4 rounded-t-lg">
          <h2 className="text-xl font-semibold text-[var(--brand-text-color)]">{agreement ? 'Edit Proposal' : 'Create Agreement'}</h2>
          <button className="text-gray-500 hover:text-gray-700 border border-[var(--brand-border)] rounded-full px-2 py-1 ml-2" onClick={onClose} aria-label="Close">&times;</button>
        </header>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-medium text-[var(--brand-text-secondary)]">Buyer:</span>
            <span className="text-[var(--brand-text)]">EcoTech Solutions</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium text-[var(--brand-text-secondary)]">Seller:</span>
            <span className="text-[var(--brand-text)]">Trust Anchor Group</span>
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-[var(--brand-text-secondary)]">Agreement Name</label>
          <input type="text" className="w-full border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-navbar)] text-[var(--brand-text)]" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-[var(--brand-text-secondary)]">Price (per ton)</label>
          <input type="text" className="w-full border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-navbar)] text-[var(--brand-text)]" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-[var(--brand-text-secondary)]">Expiry Date</label>
          <input type="text" className="w-full border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-navbar)] text-[var(--brand-text)]" value={expiry} onChange={e => setExpiry(e.target.value)} />
        </div>
        <div className="flex gap-4 mt-6 justify-end">
          <button
            className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-medium hover:bg-red-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-medium hover:bg-purple-200"
            onClick={() => onSave({ name, price, expiry })}
          >
            {agreement ? 'Make Changes' : 'Create Agreement'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default Overview;