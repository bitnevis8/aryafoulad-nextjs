export default function MissionOrderLayout({ children }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="py-6">
        <div className="container mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
} 