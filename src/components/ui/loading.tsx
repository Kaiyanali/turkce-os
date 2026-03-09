'use client';

export function Loading({ fullPage = false }: { fullPage?: boolean }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-surface-light" />
        <div className="absolute inset-0 rounded-full border-2 border-t-amber animate-spin" />
      </div>
      <p className="text-sm text-gray-500">Yükleniyor...</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{spinner}</div>;
}
