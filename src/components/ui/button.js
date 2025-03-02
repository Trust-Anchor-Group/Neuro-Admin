export function Button({ children, onClick, variant = "default", className = "" }) {
    const baseStyles = "px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 shadow-md";
  
    const variants = {
      default: "bg-blue-500 hover:bg-blue-600 text-white",
      destructive: "bg-red-500 hover:bg-red-600 text-white",
    };
  
    return (
      <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
        {children}
      </button>
    );
  }
  