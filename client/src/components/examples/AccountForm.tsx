import AccountForm from '../AccountForm';

export default function AccountFormExample() {
  return (
    <div className="p-6">
      <AccountForm 
        onSubmit={(data) => console.log('Account submitted:', data)}
        onCancel={() => console.log('Account form cancelled')}
      />
    </div>
  );
}