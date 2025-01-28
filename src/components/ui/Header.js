const Header = ({ title }) => {
  return (
    <div className="flex justify-between items-center mb-10">
      <h1 className="text-3xl font-bold text-blue-600">{title}</h1>
    </div>
  );
};

export default Header;
