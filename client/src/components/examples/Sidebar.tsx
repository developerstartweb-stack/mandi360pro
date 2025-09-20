import Sidebar from '../Sidebar';

export default function SidebarExample() {
  return (
    <div className="h-screen">
      <Sidebar 
        activeTab="dashboard" 
        onTabChange={(tab) => console.log('Tab changed to:', tab)}
      />
    </div>
  );
}