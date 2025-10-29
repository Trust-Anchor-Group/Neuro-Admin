
export const PartiesBox = () => {
  return (
    <div
      className="rounded-2xl shadow-md border p-4 w-full max-w-sm mt-2 font-sans"
      style={{
        background: 'var(--brand-background)',
        color: 'var(--brand-text)',
        borderColor: 'var(--brand-border)',
      }}
    >
    <h2 className="font-semibold text-lg mb-0" style={{color: 'var(--brand-text)'}}>Parties</h2>
      <div className="border-t my-2" style={{borderColor: 'var(--brand-border)'}} />
      <div className="flex flex-col gap-1">
        {/* EcoTech Solutions */}
        <div
          className="flex items-center gap-2 rounded-xl p-2"
          style={{background: 'var(--brand-background-secondary)'}}
        >
          <span className="text-blue-200 text-xl">🏢</span>
          <div className="flex flex-col flex-1">
            <span className="font-semibold" style={{color: 'var(--brand-text)'}}>EcoTech Solutions</span>
            <span className="flex items-center text-sm mt-1 gap-1" style={{color: 'var(--brand-text)'}}>
              <span className="text-base mr-1" style={{color: 'var(--brand-text)'}}>🏬</span>
              Client
            </span>
          </div>
        </div>
        {/* Contact person, mail, phone (overlapping blue, with gray borders) */}
        <div
          className="rounded-xl mt-1"
          style={{background: 'var(--brand-background-secondary)'}}
        >
          <div className="flex items-center gap-2 p-2">
            <span className="text-blue-200 text-xl">👤</span>
            <div className="flex flex-col flex-1">
              <span className="font-semibold" style={{color: 'var(--brand-text)'}}>Anna Lindberg</span>
              <span className="flex items-center text-sm mt-1 gap-1" style={{color: 'var(--brand-text)'}}>
                <span className="text-base mr-1" style={{color: 'var(--brand-text)'}}>👤</span>
                Contact person
              </span>
            </div>
          </div>
          <div className="border-t mx-2 my-2" style={{borderColor: 'var(--brand-border)'}} />
          <div className="flex items-center gap-2 text-xs p-2" style={{color: 'var(--brand-text)'}}>
            <span style={{color: 'var(--brand-text)'}}>✉️</span>
            alexander@trustanchorgroup.com
          </div>
          <div className="border-t mx-2 my-2" style={{borderColor: 'var(--brand-border)'}} />
          <div className="flex items-center gap-2 text-xs p-2" style={{color: 'var(--brand-text)'}}>
            <span style={{color: 'var(--brand-text)'}}>📞</span>
            +46 70 123 4567
          </div>
        </div>
        {/* Border between phone and process owner */}
    <div className="border-t mx-2 my-2" style={{borderColor: 'var(--brand-border)'}} />
        {/* Creturner */}
        <div className="flex flex-col gap-1">
          <div
            className="flex items-center gap-2 rounded-xl p-2"
            style={{background: 'var(--brand-background-secondary)'}}
          >
            <span className="text-blue-200 text-xl">🏢</span>
            <div className="flex flex-col flex-1">
              <span className="font-semibold" style={{color: 'var(--brand-text)'}}>Creturner</span>
              <span className="flex items-center text-sm mt-1 gap-1" style={{color: 'var(--brand-text)'}}>
                <span className="text-base mr-1" style={{color: 'var(--brand-text)'}}>📝</span>
                Process owner
              </span>
            </div>
          </div>
          <div
            className="flex items-center gap-2 rounded-xl p-2 mt-1"
            style={{background: 'var(--brand-background-secondary)'}}
          >
            <span className="text-blue-200 text-xl">👤</span>
            <div className="flex flex-col flex-1">
              <span className="font-semibold" style={{color: 'var(--brand-text)'}}>Anders Davidson</span>
              <span className="flex items-center text-sm mt-1 gap-1" style={{color: 'var(--brand-text)'}}>
                <span className="text-base mr-1" style={{color: 'var(--brand-text)'}}>📝</span>
                Signee
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
