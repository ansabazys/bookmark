import React, { useEffect, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { X } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-transparent hover:border-black/5 transition-all duration-300",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const Button = ({
  className,
  variant = "primary",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
}) => {
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
    outline: "border-2 border-black bg-transparent hover:bg-gray-50",
    ghost: "hover:bg-gray-100 text-gray-700",
  };

  return (
    <button
      className={cn(
        "px-6 py-3 rounded-xl font-bold transition-all duration-200 active:translate-y-[0px] active:shadow-none",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, placeholder, ...props }, ref) => {
  return (
    <div className="relative">
      <input
        ref={ref}
        className={cn(
          "flex w-full rounded-xl border-2 border-gray-200 bg-white  text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none  focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className,
        )}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";

export const Badge = ({
  className,
  variant = "blue",
  children,
}: {
  className?: string;
  variant?: "blue" | "green" | "orange";
  children: React.ReactNode;
}) => {
  const variants = {
    blue: "bg-accent-blue/30 text-blue-800",
    green: "bg-accent-green/30 text-green-800",
    orange: "bg-accent-orange/30 text-orange-800",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};

export const Modal = ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => {
    const [isVisible, setIsVisible] = useState(false);
  
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Animation duration
            document.body.style.overflow = "unset";
            return () => clearTimeout(timer);
        }
    }, [isOpen]);
  
    if (!isVisible && !isOpen) return null;
  
    return (
      <div 
        className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={onClose}
        />
        <div 
            className={cn(
                "relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 transition-all duration-300 transform",
                isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
            )}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
          {children}
        </div>
      </div>
    );
};
