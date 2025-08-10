"use client";

import BubbleChip from "./BubbleChip";

export type BubbleOption = { id: string; label: string };
type Mode = "single" | "multi";

type Props = {
  mode?: Mode;
  value: string[];                // ניהול ערכים בחוץ
  onChange: (next: string[]) => void;
  options: BubbleOption[];
};

export default function BubbleGroup({ mode = "single", value, onChange, options }: Props) {
  const toggle = (id: string) => {
    if (mode === "single") {
      onChange(value.includes(id) ? [] : [id]);
    } else {
      onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <BubbleChip key={opt.id} selected={value.includes(opt.id)} onClick={() => toggle(opt.id)}>
          {opt.label}
        </BubbleChip>
      ))}
    </div>
  );
}
