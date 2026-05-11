export function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      
      <div className="h-20 bg-gray-200 rounded-xl" />

      <div className="h-24 bg-gray-200 rounded-xl" />

      <div className="h-64 bg-gray-200 rounded-xl" />

      <div className="h-40 bg-gray-200 rounded-xl" />

      <div className="flex justify-end gap-4">
        <div className="h-10 w-24 bg-gray-200 rounded-xl" />
        <div className="h-10 w-36 bg-gray-200 rounded-xl" />
      </div>

    </div>
  );
}