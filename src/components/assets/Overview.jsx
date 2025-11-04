import React, { useState } from "react";
import { useLanguage, content } from '../../../context/LanguageContext';
import { Mail, Phone } from "lucide-react";

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
  const [showBilling, setShowBilling] = useState(true);
  const { language } = useLanguage();
  const t = content[language];

  return (
    <>
  <div className="grid grid-cols-4 gap-5 p-5">
      {/* Left column: main content (3/4) */}
  <div className=" bg-[var(--brand-background)] col-span-3 flex flex-col gap-5">
    {/* Client Info Card - unified */}
    <div
      className="rounded-2xl shadow-lg p-8 border text-base"
      style={{
        minHeight: '260px',
        color: 'var(--brand-text)',
        background: 'var(--brand-navbar)',
        borderColor: 'var(--brand-border)',
      }}
    >
      {/* Header Section */}
      <div className="relative mb-12">
        <div className="flex items-center gap-7 pt-2">
          <span className="inline-flex items-center justify-center rounded-full bg-white  border border-[var(--brand-border)] w-24 h-24 p-2 shadow absolute left-0 top-2" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', zIndex: 2 }}>
            C
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
        <div className="font-medium text-gray-600 text-[var(--brand-text-secondary)] mb-4">{t?.clientOverview?.companyInformation || 'Company Information'}</div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 items-center border-b border-[var(--brand-border)] bg-[var(--brand-background)] animate-fade-in">
            <span className="text-sm text-[var(--brand-text-secondary)] my-2">{t?.clientOverview?.regNumber || 'Reg. Number'}</span>
            <span className="text-base text-[var(--brand-text-primary)] text-start my-2">556677-8899</span>
          </div>
          <div className="grid grid-cols-3 items-center border-b border-[var(--brand-border)] bg-[var(--brand-background)] animate-fade-in">
            <span className="text-sm text-[var(--brand-text-secondary)]  my-2">{t?.clientOverview?.industry || 'Industry'}</span>
            <span className="text-base font-semibold text-[var(--brand-text-primary)] text-start my-2">Technology</span>
          </div>
          <div className="grid grid-cols-3 items-center  bg-[var(--brand-background)] animate-fade-in">
            <span className="text-sm text-[var(--brand-text-secondary)]  my-2">{t?.clientOverview?.location || 'Location'}</span>
            <span className="flex flex-col items-start justify-start my-2">
              <span className="text-base font-semibold text-[var(--brand-text-primary)]">San Francisco, USA</span>
              <span className="text-xs text-[var(--brand-text-secondary)]">456 Oak Ave, CA 94102</span>
            </span>
          </div>
        </div>
      </div>
      {/* Billing Info Section (with toggle) */}
      <div className="bg-[var(--brand-background)] rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="font-medium text-gray-600 text-[var(--brand-text-secondary)]">{t?.clientOverview?.billingInfo || 'Billing Info'}</div>
          <button
            className="p-0 m-0 text-[var(--brand-text-primary)] text-xs rounded flex items-center justify-center"
            aria-label={showBilling ? (t?.clientOverview?.ariaHideBilling || 'Hide billing info') : (t?.clientOverview?.ariaShowBilling || 'Show billing info')}
            onClick={() => setShowBilling((prev) => !prev)}
          >
            <span className="font-sm text-xs">{showBilling ? '▲' : '▼'}</span>
          </button>
        </div>
        {showBilling && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 items-center border-b border-[var(--brand-border)] bg-[var(--brand-background)]">
              <span className="text-sm text-[var(--brand-text-secondary)] my-2">{t?.clientOverview?.billingEmail || 'Billing Email'}</span>
              <span className="text-base  text-[var(--brand-text-primary)] text-start my-2">billing@ecotech.com</span>
              <span></span>
            </div>
            <div className="grid grid-cols-3 items-center border-b border-[var(--brand-border)] bg-[var(--brand-background)]">
              <span className="text-sm text-[var(--brand-text-secondary)] my-2">{t?.clientOverview?.paymentTerms || 'Payment Terms'}</span>
              <span className="text-base text-[var(--brand-text-primary)] text-start my-2">30 days</span>
              <span></span>
            </div>
            <div className="grid grid-cols-3 items-center border-b border-[var(--brand-border)] bg-[var(--brand-background)]">
              <span className="text-sm text-[var(--brand-text-secondary)] my-2">{t?.clientOverview?.vatNumber || 'VAT Number'}</span>
              <span className="text-base text-[var(--brand-text-primary)] text-start my-2">SE556677889901</span>
              <span></span>
            </div>
            <div className="grid grid-cols-3 items-center bg-[var(--brand-background)]">
              <span className="text-sm text-[var(--brand-text-secondary)] my-2">{t?.clientOverview?.invoiceDelivery || 'Invoice Delivery'}</span>
              <span className="text-base text-[var(--brand-text-primary)] text-start my-2">Email</span>
              <span></span>
            </div>
          </div>
        )}
      </div>
      {/* Client ID Section */}
      <div className="bg-[var(--brand-background)] rounded-xl p-4 mb-6 flex items-center">
        <span className="w-1/3 font-medium text-[var(--brand-text-secondary)] text-left flex items-center">{t?.clientOverview?.clientId || 'Client ID'}</span>
        <span className="w-1/3 flex justify-start items-start">
          <span className="text-[var(--brand-text-primary)]">EcoTech_Solutions</span>
        </span>
        <span className="w-1/3 flex justify-end items-center">
          <span className="px-3 py-1 rounded-full bg-green-100  text-green-700  text-xs font-semibold">{t?.clientOverview?.statusActive || 'Active'}</span>
        </span>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <button
          className="bg-purple-100 text-purple-700 px-5 py-2 rounded-xl font-semibold hover:bg-purple-200 shadow-sm"
          onClick={() => setShowModal(true)}
        >
          {t?.clientOverview?.editInformation || 'Edit Information'}
        </button>
        <button className="bg-purple-100 text-purple-700 px-5 py-2 rounded-xl font-semibold hover:bg-purple-200 shadow-sm">
          {t?.clientOverview?.manageClientId || 'Manage Client ID'}
        </button>
      </div>
    </div>
        {/* Pricing Agreements Section */}     
        <div className="bg-[var(--brand-navbar)] rounded-lg shadow-md p-5 border border-[var(--brand-border)]">
          <div className="font-semibold text-xl mb-3 text-[var(--brand-text)]">Pricing agreements</div>  
            <div className="flex justify-between items-center mb-4">
              <input type="text" placeholder="Search agreements..." className="border border-[var(--brand-border)] rounded-xl px-3 py-2 text-sm w-1/2 bg-[var(--brand-navbar)] text-[var(--brand-text)]" />
              <select className="border border-[var(--brand-border)] rounded-xl px-3 py-2 text-sm bg-[var(--brand-navbar)] text-[var(--brand-text)]">
                <option>All</option>
                <option>Active</option>
                <option>Expired</option>
              </select>
            </div>
            <div className="space-y-2">
              {pricingAgreements
                .slice((agreementPage - 1) * agreementsPerPage, agreementPage * agreementsPerPage)
                .map((agreement, idx) => (
                  <div
                    key={idx + (agreementPage - 1) * agreementsPerPage}
                    className="bg-[var(--brand-background)] rounded-xl shadow-sm p-4 flex hover:border hover:border-[var(--brand-primary)] justify-between items-center cursor-pointer"
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
            <div className="flex justify-end mt-8 border-t pt-4 border-[var(--brand-border)]">
              <button
                className="bg-purple-100 text-purple-700 px-5 py-2 rounded-xl font-medium"
                onClick={() => setCreateAgreementModal(true)}
              >
                Create New Agreement
              </button>
            </div>
        {/* Modal Popup for Create Agreement */}
        {createAgreementModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            role="dialog"
            aria-modal="true"
            aria-label="Create agreement modal"
            onClick={e => {
              if (e.target === e.currentTarget) setCreateAgreementModal(false);
            }}
          >
            <div onClick={e => e.stopPropagation()}>
              <EditProposalModal
                agreement={null}
                onClose={() => setCreateAgreementModal(false)}
                onSave={(updated) => {
                  setCreateAgreementModal(false);
                  // Optionally add agreement to state here
                }}
              />
            </div>
          </div>
        )}
        </div>
      </div>
      {/* Right column: sidebar (1/4) */}
      <div className="col-start-4 col-end-5 flex flex-col gap-5">
        {/* Purchases Card */}
        <div className="bg-[var(--brand-navbar)] border-2 border-[var(--brand-border)] rounded-lg p-5 mb-2 w-full">
          <div className="font-bold text-l mb-2 text-[var(--brand-text-secondary)]">Total purchases</div>
          <div className="text-3xl font-bold text-[var(--brand-text)]">0.8 MSEK</div>
        </div>
        {/* Compensation Card */}
        <div className="bg-[var(--brand-navbar)] border-2 border-[var(--brand-border)] rounded-lg p-5 mb-2 w-full">
          <div className="font-bold text-l mb-2 text-[var(--brand-text-secondary)]">Total compensation</div>
          <div className="text-3xl font-bold text-[var(--brand-text)]">125 tons</div>
        </div>
        {/* Contacts Card */}
        <div className="bg-[var(--brand-navbar)] border-2 border-[var(--brand-border)] rounded-lg p-5 w-full">
          <div className="font-bold text-xl mb-3 text-[var(--brand-text)]">Contacts</div>
          {contacts.map((c, idx) => (
            <div
              key={idx}
              className={`bg-[var(--brand-background)] mb-4 pb-5 pt-5 pl-5 rounded-md cursor-pointer hover:border hover:border-purple-500 ${idx < contacts.length - 1 ? '' : ''}`}
              onClick={() => alert(`Navigating to ${c.name}'s profile...`)}
            >
              <div className=" text-base font-bold text-[var(--brand-text)]">{c.name}</div>
              <div className="border-b mb-3 pb-3 border-[var(--brand-border)] text-sm text-[var(--brand-text-secondary)] mb-1">{c.role}</div>
              {idx < 3 && (
                <>
                  <div className="border-b mb-3 pb-3 border-[var(--brand-border)] flex items-center gap-2 text-sm text-[var(--brand-text-secondary)]">
                    <Mail className="text-[var(--brand-text)]" /> {c.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--brand-text-secondary)]">
                    <Phone className="text-[var(--brand-text)]" /> {c.phone}
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
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30"
          role="dialog"
          aria-modal="true"
          aria-label="Edit client modal"
          onClick={e => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <section
            className="bg-[var(--brand-navbar)] p-6 rounded-lg shadow-lg w-[512px] max-h-[90vh] overflow-y-auto border-2 border-[var(--brand-border)] relative"
            onClick={e => e.stopPropagation()}
          >
            <header className="flex justify-between items-center bg-[var(--brand-navbar)] border-b border-[var(--brand-border)] pb-3 mb-4 rounded-t-lg">
              <h2 className="text-xl font-semibold text-[var(--brand-text-color)]">Edit Client Information</h2>
            </header>
            <span className="text-[var(--brand-text-color)] font-semibold text-md">Client icon</span>
            {/* Icons row */}
            <div className="flex flex-row gap-6 mb-4 items-center justify-center">
              
              <div className="flex flex-row gap-3 items-center">
                <span className="inline-flex rounded-md items-center justify-center bg-green-100 text-green-600 w-24 h-24 text-3xl mb-2 border border-[var(--brand-border)]">{clientIcon}</span>

                <span className="inline-flex rounded-md items-center justify-center bg-gray-800 text-white w-24 h-24 text-3xl mb-2 border border-[var(--brand-border)]">{clientIconDark}</span>
              </div>
            </div>
            <div className="mb-3 border-b border-[var(--brand-border)] p-3">
              
            <div className="flex flex-row">
                
                </div>
            <div className="flex flex-col gap-2 mt-1 mb-1"> 
                <div className="rounded-lg p-2 mb-1 bg-[var(--brand-background)]">
                  <span className="block text-xs border-b border-[var(--brand-border)] text-[var(--brand-text-secondary)] mb-1">Light mode</span>
                  <div className="flex flex-row justify-between items-center w-full">
                    <div className="w-36 h-6 text-[var(--brand-text-secondary)] text-sm flex items-center justify-start">PNG Light</div>
                    <div className="flex flex-row items-center">
                      <button className="text-sm text-red-500 underline" onClick={() => setClientIcon('')}>Remove</button>
                      <button className="text-sm text-blue-500 ml-3 underline" onClick={() => setClientIcon(prompt('Enter new icon (emoji):', clientIcon) || clientIcon)}>Change</button>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg p-2  bg-[var(--brand-background)]">
                  <span className="block border-b border-[var(--brand-border)] text-xs text-[var(--brand-text-secondary)] mb-1">Dark mode</span>
                  <div className="flex flex-row justify-between items-center w-full">
                    <div className="w-36 h-6 text-[var(--brand-text-secondary)] text-sm flex items-center justify-start">PNG Dark</div>
                    <div className="flex flex-row items-center">
                      <button className="text-sm text-red-500 underline" onClick={() => setClientIconDark('')}>Remove</button>
                      <button className="text-sm text-blue-500 ml-3 underline" onClick={() => setClientIconDark(prompt('Enter new dark mode icon (emoji):', clientIconDark) || clientIconDark)}>Change</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-b border-[var(--brand-border)]">
              <div className="mb-3">
                <label className="block text-sm font-small mb-1 text-[var(--brand-text-secondary)]">Client Name</label>
                <input type="text" className="w-full border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-background)] text-[var(--brand-text)]" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-small mb-1 text-[var(--brand-text-secondary)]">Industry</label>
                <input type="text" className="w-full border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-background)] text-[var(--brand-text)]" value={industry} onChange={e => setIndustry(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-small mb-1 text-[var(--brand-text-secondary)]">Reg. Number</label>
                <input type="text" className="w-full border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-background)] text-[var(--brand-text)]" value={regNumber} onChange={e => setRegNumber(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-small mb-1 text-[var(--brand-text-secondary)]">Address</label>
                <input type="text" className="w-full border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-background)] text-[var(--brand-text)]" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-4 mt-6 justify-end">
              <button
                className="bg-red-100 text-red-700 w-[50%] px-4 py-2 rounded-xl font-medium hover:bg-red-200"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-purple-100 text-purple-700 w-[50%] px-4 py-2 rounded-xl font-medium hover:bg-purple-200"
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
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            role="dialog"
            aria-modal="true"
            aria-label="Agreement details modal"
            onClick={e => {
              if (e.target === e.currentTarget) setAgreementModal({ open: false, agreement: null });
            }}
          >
            <section
              className="bg-[var(--brand-navbar)] p-6 rounded-lg shadow-lg w-[512px] max-h-[90vh] overflow-y-auto border-2 border-[var(--brand-border)] relative"
              onClick={e => e.stopPropagation()}
            >
              <header className="flex justify-between items-center bg-[var(--brand-navbar)] border-b border-[var(--brand-border)] pb-3 mb-2 rounded-t-lg">
                <h2 className="text-xl font-semibold text-[var(--brand-text-color)]">{agreementModal.agreement?.title}</h2>
              </header> 
              <div className="mb-5">
                <span className="font-medium text-[var(--brand-text-secondary)]">Price agreement proposal</span>
              </div>
              <div className="mb-4 pl-4 pr-4">
                <div className="mb-3 border-b border-[var(--brand-border)]">
                  <span className="font-small text-sm text-[var(--brand-text)]">Pricing agreement terms</span>
                </div>
                <div className="flex justify-between border-b border-[var(--brand-border)] mb-3">
                  <span className="font-medium text-[var(--brand-text-secondary)] mb-3">Buyer:</span>
                    <span className="text-[var(--brand-text)]">EcoTech Solutions</span>
                </div>
                <div className="flex justify-between border-b border-[var(--brand-border)] mb-3">
                  <span className="font-medium text-[var(--brand-text-secondary)] mb-3">Seller:</span>
                    <span className="text-[var(--brand-text)]">Trust Anchor Group</span>
                </div>
                <div className="flex justify-between border-b border-[var(--brand-border)] mb-3">
                  <span className="font-medium text-[var(--brand-text-secondary)] mb-3">Price (per ton):</span>
                    <span className="text-[var(--brand-text)]">{agreementModal.agreement?.price || '-'}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="font-medium text-[var(--brand-text-secondary)] mb-3">Expiry date:</span>
                    <span className="text-[var(--brand-text)]">{agreementModal.agreement?.date || '-'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-6 justify-end">
                <button
                  className="bg-purple-100  text-purple-700 px-4 py-2 rounded-xl font-medium hover:bg-purple-200"
                  onClick={() => {
                    setEditProposalModal({ open: true, agreement: agreementModal.agreement });
                  }}
                >
                  Edit Proposal
                </button>
                <div className="flex flex-row gap-2">
                <button
                  className="bg-red-700 text-white w-1/2 px-4 py-2 rounded-xl font-medium hover:bg-red-800"
                  onClick={() => setAgreementModal({ open: false, agreement: null })}
                >
                  Deny
                </button>
                <button
                  className="bg-purple-900 text-white w-1/2 px-4 py-2 rounded-xl font-medium hover:bg-purple-800"
                  onClick={() => setAgreementModal({ open: false, agreement: null })}
                >
                  Approve
                </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Modal Popup for Edit Proposal */}
        {editProposalModal.open && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30"
            role="dialog"
            aria-modal="true"
            aria-label="Edit proposal modal"
            onClick={e => {
              if (e.target === e.currentTarget) setEditProposalModal({ open: false, agreement: null });
            }}
          >
            <EditProposalModal
              agreement={editProposalModal.agreement}
              onClose={() => setEditProposalModal({ open: false, agreement: null })}
              onSave={(updated) => {
                setEditProposalModal({ open: false, agreement: null });
                // Optionally update agreement in state here
              }}
            />
          </div>
        )}
    </>
  );
};

// Edit Proposal Modal Component
function EditProposalModal({ agreement, onClose, onSave }) {
  const [name, setName] = useState(agreement?.title || '');
  const [price, setPrice] = useState(agreement?.price || '');
  // Split expiry into year, month, day, time
  const initialDate = agreement?.date ? new Date(agreement.date) : null;
  const [expiryYear, setExpiryYear] = useState(initialDate ? initialDate.getFullYear() : '');
  const [expiryMonth, setExpiryMonth] = useState(initialDate ? String(initialDate.getMonth() + 1).padStart(2, '0') : '');
  const [expiryDay, setExpiryDay] = useState(initialDate ? String(initialDate.getDate()).padStart(2, '0') : '');
  const [expiryTime, setExpiryTime] = useState(initialDate ? initialDate.toTimeString().slice(0,5) : '');
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  return (
    <section className="bg-[var(--brand-navbar)] p-6 rounded-lg shadow-lg w-[512px] max-h-[90vh] overflow-y-auto border-2 border-[var(--brand-border)] relative">
        <header className="flex justify-between items-center bg-[var(--brand-navbar)] border-b border-[var(--brand-border)] pb-3 mb-4 rounded-t-lg">
          <h2 className="text-xl font-semibold text-[var(--brand-text-color)]">{agreement ? 'Edit pricing agreement proposal' : 'New pricing agreement'}</h2>
        </header>
        <div className="border-b border-[var(--brand-border)] mb-4">
          <div className="flex flex-col justify-between mb-6">
            <span className="font-medium mb-3 text-[var(--brand-text)]">Buyer</span>
            <div className="flex flex-row">
              <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-600 w-14 h-14 border border-[var(--brand-border)]">
                C
              </span>
            <div className=" ml-4 flex flex-col">
            <span className="text-[var(--brand-text)]">EcoTech Solutions</span>
            <span className="text-[var(--brand-text-secondary)]">Client</span>
            </div>
            </div>
          </div>
          <div className="flex flex-col justify-between mb-6">
            <span className="font-medium mb-3 text-[var(--brand-text)]">Seller</span>
            <div className="flex flex-row">
              <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-600 w-14 h-14 border border-[var(--brand-border)]">
                C
              </span>
            <div className=" ml-4 flex flex-col">
            <span className="text-[var(--brand-text)]">Trust Anchor Group</span>
            <span className="text-[var(--brand-text-secondary)]">Process Owner</span>
            </div>
            </div>
          </div>
        </div>
        <div className="border-b border-[var(--brand-border)] mb-4">
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-[var(--brand-text-secondary)]">Agreement Name</label>
          <input type="text" className="w-full border border-[var(--brand-border)] bg-[var(--brand-background)] rounded-lg px-3 py-2 text-[var(--brand-text)]" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-[var(--brand-text-secondary)]">Price (per ton)</label>
          <input type="text" className="w-full border border-[var(--brand-border)] bg-[var(--brand-background)] rounded-lg px-3 py-2 text-[var(--brand-text)]" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        </div>
        <div className="border-b border-[var(--brand-border)] pb-3 mb-3">
          <div className="flex flex-row mb-2">
          <input
            type="checkbox"
            className="mr-2 w-5 h-5 accent-purple-600 focus:ring-purple-500"
            style={{ accentColor: '#9333ea' }}
            checked={expiryEnabled}
            onChange={e => setExpiryEnabled(e.target.checked)}
          />
          <div className="flex items-center">
            <label className="text-sm font-medium -mt-0.5 text-[var(--brand-text)]">Set expiry date</label>
          </div>
          </div>
          <label className="block text-sm font-medium mb-2 text-[var(--brand-text-secondary)]">Expiry Date</label>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="number"
              min="2023"
              max="2100"
              placeholder="Year"
              className="border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-background)] text-[var(--brand-text)]"
              value={expiryYear}
              onChange={e => setExpiryYear(e.target.value)}
              disabled={!expiryEnabled}
            />
            <input
              type="number"
              min="1"
              max="12"
              placeholder="Month"
              className="border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-background)] text-[var(--brand-text)]"
              value={expiryMonth}
              onChange={e => setExpiryMonth(e.target.value)}
              disabled={!expiryEnabled}
            />
            <input
              type="number"
              min="1"
              max="31"
              placeholder="Day"
              className="border border-[var(--brand-border)] rounded-lg px-3 py-2 bg-[var(--brand-background)] text-[var(--brand-text)]"
              value={expiryDay}
              onChange={e => setExpiryDay(e.target.value)}
              disabled={!expiryEnabled}
            />
            <input
              type="time"
              placeholder="Time"
              className="border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--brand-background)] text-[var(--brand-text)]"
              value={expiryTime}
              onChange={e => setExpiryTime(e.target.value)}
              disabled={!expiryEnabled}
            />
          </div>
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
            onClick={() => {
              let expiry = '';
              if (expiryEnabled) {
                expiry = `${expiryYear}-${expiryMonth.padStart(2,'0')}-${expiryDay.padStart(2,'0')}T${expiryTime}`;
                if (!expiryYear || !expiryMonth || !expiryDay || !expiryTime) {
                  alert('Please fill in all expiry date fields.');
                  return;
                }
              }
              onSave({ name, price, expiry });
            }}
            disabled={expiryEnabled && (!expiryYear || !expiryMonth || !expiryDay || !expiryTime)}
          >
            {agreement ? 'Make Changes' : 'Create Agreement'}
          </button>
        </div>
      </section>
  );
}

export default Overview;