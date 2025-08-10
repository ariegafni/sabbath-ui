import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary" };
export default function Button({ className, variant="primary", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
  const styles = variant==="primary"
    ? "bg-purple-600 text-white hover:bg-purple-700"
    : "bg-white text-purple-700 border border-purple-200 hover:bg-purple-50";
  return <button {...props} className={clsx(base, styles, className)} />;
}
