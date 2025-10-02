import { useEffect } from "react";

/**
 * Hook to enable Enter key navigation between form fields
 * Press Enter to move to the next input/select/textarea
 */
export function useEnterKeyNavigation(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        
        // Don't interfere with textarea (allow new lines), buttons, selects, or combobox triggers
        if (
          target.tagName === "TEXTAREA" ||
          target.tagName === "BUTTON" ||
          target.getAttribute("role") === "combobox" ||
          target.closest('[role="combobox"]') ||
          target.tagName === "SELECT"
        ) {
          return;
        }

        // For input fields and other form elements
        if (
          target.tagName === "INPUT" ||
          target.hasAttribute("contenteditable")
        ) {
          e.preventDefault();

          // Get all focusable elements in the form
          const form = target.closest("form");
          if (!form) return;

          const focusableElements = Array.from(
            form.querySelectorAll<HTMLElement>(
              'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button[type="submit"], [role="combobox"]:not([aria-disabled="true"])'
            )
          );

          const currentIndex = focusableElements.indexOf(target);
          const nextIndex = currentIndex + 1;

          if (nextIndex < focusableElements.length) {
            const nextElement = focusableElements[nextIndex];
            nextElement.focus();
            
            // If it's an input, select all text for easy replacement
            if (nextElement.tagName === "INPUT") {
              (nextElement as HTMLInputElement).select();
            }
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
