import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const SheetContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  open: false,
  setOpen: () => {},
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
  React.HTMLAttributes<HTMLDivElement> & { side?: "left" | "right" }
>(({ side = "right", className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SheetContext)

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
             {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
                onClick={() => setOpen(false)}
            />
            
            <div className={cn(
                "fixed inset-y-0 z-50 flex h-full w-3/4 flex-col border-l border-slate-100 bg-white shadow-2xl transition ease-in-out sm:max-w-md",
                 side === "right" ? "right-0 inset-y-0" : "left-0 inset-y-0 border-r border-l-0",
                 // Animation classes
                 side === "right" ? "slide-in-from-right-full" : "slide-in-from-left-full",
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
        "flex items-center justify-between p-6 border-b border-slate-100",
        className
      )}
      {...props}
    >
      <div className="flex-1">
        {children}
      </div>
      <button
        className="ml-4 rounded-lg p-2 opacity-70 transition-all hover:opacity-100 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={() => setOpen(false)}
      >
        <X className="h-5 w-5 text-slate-500" />
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
    className={cn("text-lg font-bold text-slate-800", className)}
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
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-auto border-t border-slate-100 pt-6",
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
