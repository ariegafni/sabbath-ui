export default function LoadingSpinner({ className = "", text = "טוען..." }: { className?: string; text?: string }) {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
        <span className="text-gray-600 text-sm">{text}</span>
      </div>
    </div>
  );
}