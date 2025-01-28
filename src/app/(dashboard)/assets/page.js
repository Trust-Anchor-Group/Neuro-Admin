
import UserCard from "@/components/ui/UserCard";

const AdminPage = () => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */} 
      <div className="w-full lg:w-3/2 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="Amount Sold" />
          <UserCard type="Total volume compensated" />
        </div>
     
      </div>
      
    </div>
  );
};

export default AdminPage;