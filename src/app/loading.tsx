export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="h-28 bg-muted rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="h-28 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

