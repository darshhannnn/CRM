import { getInitials, stringToColor } from "@/lib/utils";

export function Avatar({ name, className = "" }: { name: string; className?: string }) {
  const initials = getInitials(name);
  const color = stringToColor(name);
  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-medium ${className}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
