import Header from '../Header';

export default function HeaderExample() {
  return (
    <Header 
      currentFY="2025-26" 
      onFYChange={(fy) => console.log('FY changed to:', fy)}
      onMenuClick={() => console.log('Menu clicked')}
    />
  );
}