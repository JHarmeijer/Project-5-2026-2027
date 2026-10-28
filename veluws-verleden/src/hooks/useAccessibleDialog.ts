import { useEffect, useRef } from "react";

const focusableElements =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function useAccessibleDialog(
  open: boolean,
  onClose: () => void,
  dialogRef: React.RefObject<HTMLElement | null>,
) {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const activeDialog = dialogRef.current;
    if (!open || !activeDialog) return;
    const dialogElement: HTMLElement = activeDialog;

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => [...dialogElement.querySelectorAll<HTMLElement>(focusableElements)]
      .filter((element) =>
        element.getAttribute("aria-hidden") !== "true" &&
        element.getClientRects().length > 0,
      );
    const first = focusable()[0] ?? dialogElement;
    first.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) {
        event.preventDefault();
        dialogElement.focus();
        return;
      }

      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === firstItem || !dialogElement.contains(document.activeElement))) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && (document.activeElement === lastItem || !dialogElement.contains(document.activeElement))) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [dialogRef, open]);
}
