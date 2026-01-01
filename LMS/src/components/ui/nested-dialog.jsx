import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * NestedDialog - דיאלוג מיוחד לשימוש בתוך דיאלוגים אחרים
 * מונע בעיות של סגירה אוטומטית בגלל אינטראקציה חיצונית
 */

const NestedDialog = DialogPrimitive.Root

const NestedDialogTrigger = DialogPrimitive.Trigger

const NestedDialogPortal = DialogPrimitive.Portal

const NestedDialogClose = DialogPrimitive.Close

const NestedDialogOverlay = React.forwardRef(({ className, onClick, ...props }, ref) => {
  // Prevent click events from propagating to parent dialogs
  const handleClick = React.useCallback((e) => {
    e.stopPropagation();
    if (onClick) onClick(e);
  }, [onClick]);

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      onClick={handleClick}
      className={cn(
        "fixed inset-0 z-[9999] bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
})
NestedDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const NestedDialogContent = React.forwardRef(({ className, children, onInteractOutside, onEscapeKeyDown, ...props }, ref) => {
  // מניעה אוטומטית של סגירה על אינטראקציה חיצונית (אלא אם מועבר handler מותאם)
  const defaultHandleInteractOutside = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const defaultHandleEscapeKeyDown = React.useCallback((e) => {
    // Allow Esc but prevent propagation to parent dialog
    e.stopPropagation();
  }, []);

  return (
    <NestedDialogPortal>
      <NestedDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        onInteractOutside={onInteractOutside || defaultHandleInteractOutside}
        onEscapeKeyDown={onEscapeKeyDown || defaultHandleEscapeKeyDown}
        className={cn(
          "fixed left-[50%] top-[50%] z-[10000] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </NestedDialogPortal>
  );
})
NestedDialogContent.displayName = DialogPrimitive.Content.displayName

const NestedDialogHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-right",
      className
    )}
    {...props} />
)
NestedDialogHeader.displayName = "NestedDialogHeader"

const NestedDialogFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2",
      className
    )}
    {...props} />
)
NestedDialogFooter.displayName = "NestedDialogFooter"

const NestedDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props} />
))
NestedDialogTitle.displayName = DialogPrimitive.Title.displayName

const NestedDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
NestedDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  NestedDialog,
  NestedDialogPortal,
  NestedDialogOverlay,
  NestedDialogClose,
  NestedDialogTrigger,
  NestedDialogContent,
  NestedDialogHeader,
  NestedDialogFooter,
  NestedDialogTitle,
  NestedDialogDescription,
}