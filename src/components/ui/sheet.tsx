import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const SheetContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  open: false,
  setOpen: () => { },
})

// Wrapper to handle controlled/uncontrolled state
interface SheetRootProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const SheetRoot = ({ children, open, onOpenChange }: SheetRootProps) => {
  return (
    <SheetContext.Provider value={{
      open: open ?? false,
      setOpen: (val) => onOpenChange?.(val as boolean)
    }}>
      {children}
    </SheetContext.Provider>
  )
}

const SheetTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
  const { setOpen } = React.useContext(SheetContext)

  const handleClick = () => {
    setOpen(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onClick: handleClick
    })
  }

  return <button onClick={handleClick}>{children}</button>
}

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: "left" | "right" | "bottom" }
>(({ side = "right", className, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(SheetContext)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => setOpen(false)}
      />

      <div className={cn(
        "fixed z-[100] flex flex-col border-border bg-card shadow-2xl transition ease-in-out",
        side === "right" && "inset-y-0 right-0 h-full w-full border-l sm:w-3/4 sm:max-w-md slide-in-from-right-full",
        side === "left" && "inset-y-0 left-0 h-full w-full border-r sm:w-3/4 sm:max-w-md slide-in-from-left-full",
        side === "bottom" && "inset-x-0 bottom-0 h-[92vh] w-full border-t rounded-t-[32px] slide-in-from-bottom-full",
        className
      )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    </div>
  )
})
SheetContent.displayName = "SheetContent"

const SheetHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { setOpen } = React.useContext(SheetContext)

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 sm:p-5 pb-2.5 sm:pb-3 shrink-0",
        className
      )}
      {...props}
    >
        <div className="min-w-0 flex-1">
          {children}
        </div>
      <button
        className="ml-3 rounded-lg p-1.5 sm:p-2 opacity-60 transition-all hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={() => setOpen(false)}
      >
        <X className="h-4 w-4 text-muted-foreground" />
        <span className="sr-only">Cerrar</span>
      </button>
    </div>
  )
}
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-sm sm:text-base font-semibold text-foreground uppercase tracking-tight", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-auto border-t border-border pt-4",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"


export {
  SheetRoot as Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
}
