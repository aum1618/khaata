"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Neo Brutalism Button
interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "warning"
    | "destructive"
    | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
}

export const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    const variants = {
      primary: "bg-[#A6FAFF] hover:bg-[#79F7FF] active:bg-[#00E1EF]",
      secondary: "bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea]",
      accent: "bg-[#B8FF9F] hover:bg-[#9dfc7c] active:bg-[#7df752]",
      warning: "bg-[#FFC29F] hover:bg-[#FFB080] active:bg-[#FF965B]",
      destructive: "bg-[#FF6B6B] hover:bg-[#FF5252] active:bg-[#FF3838]",
      ghost: "bg-white hover:bg-gray-100 active:bg-gray-200",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "border-black border-2 font-medium transition-all",
          "hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]",
          "active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
          "rounded-md flex items-center justify-center gap-2",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
NeoButton.displayName = "NeoButton";

// Neo Brutalism Input
interface NeoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const NeoInput = React.forwardRef<HTMLInputElement, NeoInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full border-black border-2 p-2.5 bg-white rounded-md",
          "focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:bg-[#FFA6F6]",
          "placeholder:text-gray-400",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    );
  },
);
NeoInput.displayName = "NeoInput";

// Neo Brutalism Textarea
interface NeoTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const NeoTextarea = React.forwardRef<
  HTMLTextAreaElement,
  NeoTextareaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full border-black border-2 p-2.5 bg-white rounded-md resize-none",
        "focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:bg-[#FFA6F6]",
        "placeholder:text-gray-400",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
});
NeoTextarea.displayName = "NeoTextarea";

// Neo Brutalism Card
interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "accent";
  shadow?: "none" | "sm" | "md" | "lg";
}

export const NeoCard = React.forwardRef<HTMLDivElement, NeoCardProps>(
  (
    { className, variant = "default", shadow = "md", children, ...props },
    ref,
  ) => {
    const variants = {
      default: "bg-white",
      primary: "bg-[#A6FAFF]",
      secondary: "bg-[#FFA6F6]",
      accent: "bg-[#B8FF9F]",
    };

    const shadows = {
      none: "",
      sm: "shadow-[2px_2px_0px_rgba(0,0,0,1)]",
      md: "shadow-[4px_4px_0px_rgba(0,0,0,1)]",
      lg: "shadow-[8px_8px_0px_rgba(0,0,0,1)]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "border-black border-2 rounded-md",
          variants[variant],
          shadows[shadow],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
NeoCard.displayName = "NeoCard";

// Neo Brutalism Checkbox
interface NeoCheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
}

export const NeoCheckbox = React.forwardRef<HTMLInputElement, NeoCheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              "appearance-none w-5 h-5 border-2 border-black rounded-sm bg-[#FFC29F] cursor-pointer",
              "checked:bg-[#FF965B]",
              "hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]",
              "focus:outline-none focus:ring-0",
              className,
            )}
            {...props}
          />
          <svg
            className="absolute top-0.5 left-1 w-3 h-3 pointer-events-none opacity-0 peer-checked:opacity-100"
            style={{ opacity: "var(--checkbox-opacity, 0)" }}
            fill="none"
            stroke="black"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        {label && <span className="text-sm font-medium">{label}</span>}
      </label>
    );
  },
);
NeoCheckbox.displayName = "NeoCheckbox";

// Neo Brutalism Select
interface NeoSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export const NeoSelect = React.forwardRef<HTMLSelectElement, NeoSelectProps>(
  ({ className, options, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full border-black border-2 p-2.5 bg-white rounded-md appearance-none cursor-pointer",
          "focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]",
          "bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5rem]",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  },
);
NeoSelect.displayName = "NeoSelect";

// Neo Brutalism Badge
interface NeoBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "accent"
    | "warning"
    | "destructive";
}

export const NeoBadge = React.forwardRef<HTMLSpanElement, NeoBadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-white",
      primary: "bg-[#A6FAFF]",
      secondary: "bg-[#FFA6F6]",
      accent: "bg-[#B8FF9F]",
      warning: "bg-[#FFC29F]",
      destructive: "bg-[#FF6B6B]",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2 py-1 text-xs font-medium border-black border-2 rounded-md",
          variants[variant],
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);
NeoBadge.displayName = "NeoBadge";

// Neo Brutalism Avatar
interface NeoAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

export const NeoAvatar = React.forwardRef<HTMLDivElement, NeoAvatarProps>(
  ({ className, name, src, size = "md", ...props }, ref) => {
    const sizes = {
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-12 h-12 text-base",
    };

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const getColor = (name: string) => {
      const colors = ["#A6FAFF", "#FFA6F6", "#B8FF9F", "#FFC29F", "#FEF08A"];
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-full border-2 border-black flex items-center justify-center font-bold overflow-hidden",
          sizes[size],
          className,
        )}
        style={{ backgroundColor: src ? undefined : getColor(name) }}
        {...props}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>
    );
  },
);
NeoAvatar.displayName = "NeoAvatar";

// Neo Brutalism Modal
interface NeoModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const NeoModal: React.FC<NeoModalProps> = ({
  open,
  onClose,
  title,
  children,
}) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 neo-modal-backdrop"
        onClick={onClose}
      />
      <NeoCard
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-auto neo-modal-panel"
        shadow="lg"
      >
        {title && (
          <div className="px-6 py-4 border-b-2 border-black">
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
        )}
        <div className="p-6">{children}</div>
      </NeoCard>
    </div>
  );
};

// Neo Brutalism Tabs
interface NeoTabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const NeoTabs: React.FC<NeoTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div className={cn("flex   border-b-2 border-black", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex flex-1 justify-center  items-center gap-2 px-4 py-2 font-medium transition-colors border-r-2 border-black last:border-r-0",
            activeTab === tab.id
              ? "bg-[#A6FAFF]"
              : "bg-white hover:bg-gray-100",
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// Neo Brutalism Toggle Switch
interface NeoToggleProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
}

export const NeoToggle = React.forwardRef<HTMLInputElement, NeoToggleProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              "w-11 h-6 bg-gray-300 rounded-full border-2 border-black",
              "peer-checked:bg-[#FFA6F6]",
              "peer-checked:shadow-[2px_2px_0px_rgba(0,0,0,1)]",
              "after:content-[''] after:absolute after:top-[3px] after:left-[3px]",
              "after:w-4 after:h-4 after:bg-white after:rounded-full after:border-2 after:border-black",
              "after:transition-all peer-checked:after:translate-x-5",
              className,
            )}
          />
        </div>
        {label && <span className="text-sm font-medium">{label}</span>}
      </label>
    );
  },
);
NeoToggle.displayName = "NeoToggle";

// Neo Brutalism Divider
export const NeoDivider: React.FC<{ className?: string }> = ({ className }) => {
  return <hr className={cn("border-t-2 border-black", className)} />;
};
