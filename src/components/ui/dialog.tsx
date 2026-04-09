import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
// Simple Dialog implementation without heavy dependencies like Radix UI
// in a real-world scenario, using @radix-ui/react-dialog is recommended for Full A11y

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => { },
})

const Dialog = ({ children, open = false, onOpenChange }: DialogProps) => {
  const [isOpen, setIsOpen] = React.useState(open)

  React.useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleOpenChange = (value: boolean) => {
    setIsOpen(value)
    onOpenChange?.(value)
  }

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
  const { onOpenChange } = React.useContext(DialogContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        const childProps = (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props;
        childProps.onClick?.(e)
        onOpenChange(true)
      }
    })
  }

  return (
    <button onClick={() => onOpenChange(true)}>{children}</button>
  )
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(DialogContext)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Content */}
      <div
        ref={ref}
        className={cn(
          "relative z-50 w-full max-w-lg max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-xl sm:rounded-2xl bg-card border border-border p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200",
          className
        )}
        {...props}
      >
        <button
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-lg p-1.5 opacity-60 transition-all hover:opacity-100 hover:bg-muted focus:outline-none"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col text-center sm:text-left mb-6",
      "flex flex-col text-center sm:text-left mb-4 sm:mb-6",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-border",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-base sm:text-lg font-semibold leading-tight tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
