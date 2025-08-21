import { Input } from "@/components/aria/input";
import { cn } from "@/lib/utils";

interface HexColorInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  ref?: React.Ref<HTMLInputElement>;
}

function isValidHexColor(hex: string): boolean {
  if (!hex) return false;
  // Remove # if present
  const cleanHex = hex.replace("#", "");
  // Check if it's 3 or 6 characters and only contains valid hex chars
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex);
}

function normalizeHexColor(hex: string): string {
  if (!hex) return "";

  // Remove # if present
  let cleanHex = hex.replace("#", "");

  // If it's a valid 3-character hex, expand it to 6 characters
  if (/^[0-9A-Fa-f]{3}$/.test(cleanHex)) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Return with # prefix
  return `#${cleanHex.toLowerCase()}`;
}

export function validateHexColor(value: string): string | undefined {
  if (!value || value.trim().length === 0) {
    return "Color is required";
  }

  if (!isValidHexColor(value)) {
    return "Enter a valid hex color (e.g., #FF0000 or #F00)";
  }

  return undefined;
}

export function HexColorInput({
  value,
  onChange,
  onBlur,
  placeholder = "#000000",
  className,
  id,
  name,
  ref,
}: HexColorInputProps) {
  const isValid = isValidHexColor(value);
  const normalizedColor = isValid ? normalizeHexColor(value) : "#000000";

  const handleChange = (inputValue: string) => {
    onChange(inputValue);
  };

  const handleBlur = () => {
    // Normalize the color on blur if it's valid
    if (isValidHexColor(value)) {
      onChange(normalizeHexColor(value));
    }
    onBlur?.();
  };

  return (
    <div className="h-18">
      <div className="flex items-center gap-3">
        {/* Color preview swatch */}
        <div
          className="h-10 w-10 rounded border-2 border-gray-300 flex-shrink-0"
          style={{
            backgroundColor: isValid ? normalizedColor : "#f3f4f6",
          }}
          title={
            isValid ? `Color preview: ${normalizedColor}` : "Invalid color"
          }
        />

        {/* Hex input field */}
        <Input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "font-mono text-sm flex-1",
            !isValid && value && "border-red-300 focus-visible:ring-red-500",
            className,
          )}
          maxLength={7} // #FFFFFF
        />
      </div>

      {/* Color value display when valid */}
      {isValid && (
        <p className="text-xs text-gray-500 mt-1">
          {normalizedColor.toUpperCase()}
        </p>
      )}
    </div>
  );
}

