export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}