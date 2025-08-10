"use client";
import { forwardRef } from "react";

type Props = {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

const BubbleChip = forwardRef<HTMLButtonElement, Props>(({ selected, onClick, children }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className={[
      "px-4 py-2 rounded-full border text-sm transition-all select-none",
      "shadow-[inset_0_-1px_0_rgba(0,0,0,0.04)]",
      selected
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:bg-gray-50",
      "focus:outline-none focus:ring-2 focus:ring-blue-500"
    ].join(" ")}
    type="button"
  >
    {children}
  </button>
));
BubbleChip.displayName = "BubbleChip";
export default BubbleChip;
