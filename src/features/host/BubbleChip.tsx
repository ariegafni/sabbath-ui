"use client";
import { forwardRef } from "react";

type Props = {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

const BubbleChip = forwardRef<HTMLButtonElement, Props>(
  ({ selected, onClick, children }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={[
        "px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border text-xs sm:text-sm transition-all duration-200 select-none font-medium",
        "shadow-sm hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        selected
          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900",
      ].join(" ")}
      type="button"
    >
      {children}
    </button>
  )
);
BubbleChip.displayName = "BubbleChip";
export default BubbleChip;
