import LotForm from '../LotForm';

export default function LotFormExample() {
  return (
    <div className="p-6">
      <LotForm 
        onSubmit={(data) => console.log('Form submitted:', data)}
        onCancel={() => console.log('Form cancelled')}
      />
    </div>
  );
}