"use client";

import BubbleChip from "./BubbleChip";

export type BubbleOption = { id: string; label: string };
type Mode = "single" | "multi";

type Props = {
  mode?: Mode;
  value: string[];
  onChange: (next: string[]) => void;
  options: BubbleOption[];
};

export default function BubbleGroup({
  mode = "single",
  value,
  onChange,
  options,
}: Props) {
  const toggle = (id: string) => {
    if (mode === "single") {
      onChange(value.includes(id) ? [] : [id]);
    } else {
      onChange(
        value.includes(id) ? value.filter((x) => x !== id) : [...value, id]
      );
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
      {options.map((opt) => (
        <BubbleChip
          key={opt.id}
          selected={value.includes(opt.id)}
          onClick={() => toggle(opt.id)}
        >
          {opt.label}
        </BubbleChip>
      ))}
    </div>
  );
}
