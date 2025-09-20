import DashboardModule from '../DashboardModule';
import { useState } from 'react';

export default function DashboardModuleExample() {
  const [currentFY, setCurrentFY] = useState("2025-26");
  
  return (
    <DashboardModule 
      currentFY={currentFY}
      onFYChange={setCurrentFY}
    />
  );
}