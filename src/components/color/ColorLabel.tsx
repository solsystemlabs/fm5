import { useNavigate } from '@tanstack/react-router'

export function ColorLabel({
  color,
  name,
  brand,
  filamentId,
}: {
  color: string;
  name: string;
  brand?: string;
  filamentId?: number;
}) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (filamentId) {
      navigate({ to: '/filaments' })
    }
  }

  return (
    <div
      className={`inline-flex items-center gap-x-2 rounded min-w-30 px-3 py-2 text-md text-gray-600 border-gray-200 ${
        filamentId ? 'cursor-pointer hover:bg-opacity-60 transition-colors' : ''
      }`}
      style={{ backgroundColor: `${color}40` }}
      onClick={handleClick}
    >
      <div
        className="size-5 rounded border border-gray-200 shrink-0"
        style={{ backgroundColor: color }}
        aria-label={`${name} color indicator`}
      />
      <div className="flex flex-col">
        <div className="font-medium text-gray-900">{name}</div>
        {brand && <div className="text-gray-600">{brand}</div>}
      </div>
    </div>
  );
}
