export function Table({ children, className = "" }) {
    return <table className={`w-full border-collapse ${className}`}>{children}</table>;
  }
  
  export function TableHeader({ children }) {
    return <thead className="bg-gray-100">{children}</thead>;
  }
  
  export function TableRow({ children }) {
    return <tr className="border-b">{children}</tr>;
  }
  
  export function TableHead({ children }) {
    return <th className="p-3 text-left">{children}</th>;
  }
  
  export function TableBody({ children }) {
    return <tbody>{children}</tbody>;
  }
  
  export function TableCell({ children }) {
    return <td className="p-3">{children}</td>;
  }
  