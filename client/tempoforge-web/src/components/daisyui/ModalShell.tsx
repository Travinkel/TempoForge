import React from "react";
import { createPortal } from "react-dom";

type ModalShellProps = {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  labelledBy?: string;
  describedBy?: string;
  lockBodyScroll?: boolean;
  className?: string;
  backdropClassName?: string;
  container?: Element | DocumentFragment | null;
  disablePortal?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  role?: "dialog" | "alertdialog";
};

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export default function ModalShell({
  open,
  onClose,
  children,
  labelledBy,
  describedBy,
  lockBodyScroll = false,
  className,
  backdropClassName,
  container,
  disablePortal = false,
  closeOnEscape = true,
  closeOnBackdrop = true,
  role = "dialog",
}: ModalShellProps) {
  const portalTarget = React.useMemo(() => {
    if (disablePortal) {
      return null;
    }
    if (container) {
      return container;
    }
    if (typeof document === "undefined") {
      return null;
    }
    return document.body;
  }, [container, disablePortal]);

  React.useEffect(() => {
    if (!open || !lockBodyScroll) {
      return undefined;
    }
    if (typeof document === "undefined") {
      return undefined;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.classList.add("modal-open");
    body.style.overflow = "hidden";

    return () => {
      body.classList.remove("modal-open");
      body.style.overflow = previousOverflow;
    };
  }, [lockBodyScroll, open]);

  React.useEffect(() => {
    if (!open || !closeOnEscape || !onClose) {
      return undefined;
    }
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEscape, onClose, open]);

  if (!open) {
    return null;
  }

  if (!disablePortal && !portalTarget) {
    return null;
  }

  const content = (
    <div
      className={joinClasses("modal", open && "modal-open", className)}
      role={role}
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    >
      {children}
      <div
        className={joinClasses("modal-backdrop bg-black/40", backdropClassName)}
        onClick={closeOnBackdrop && onClose ? () => onClose() : undefined}
        role="presentation"
      />
    </div>
  );

  if (disablePortal) {
    return content;
  }

  return createPortal(content, portalTarget as Element | DocumentFragment);
}
