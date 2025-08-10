export function ColorLabel({
  color,
  name,
  brand,
}: {
  color: string;
  name: string;
  brand: string;
}) {
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600">
      <svg
        viewBox="0 0 6 6"
        aria-hidden="true"
        className="size-1.5 fill-gray-400"
      >
        <circle r={3} cx={3} cy={3} />
      </svg>
      Badge
    </span>
  );
}
