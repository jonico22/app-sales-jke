import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  open: false,
  setOpen: () => {},
})

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent immediate closing if we had a click handler on window
    e.stopPropagation()
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onClick: handleClick,
      // aria-expanded: open // Good for a11y
    })
  }

  return (
    <button onClick={handleClick} className="inline-flex justify-center w-full">
      {children}
    </button>
  )
}

const DropdownMenuContent = ({ 
  children, 
  className,
  align = "end" 
}: { 
  children: React.ReactNode, 
  className?: string,
  align?: "start" | "end" | "center"
}) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext)
  const ref = React.useRef<HTMLDivElement>(null)

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-2 w-56 rounded-xl border border-slate-100 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100",
        align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2",
        className
      )}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  )
}

const DropdownMenuItem = ({ 
  children, 
  className, 
  onClick,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { setOpen } = React.useContext(DropdownMenuContext)

  return (
    <div
      className={cn(
        "block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors",
        className
      )}
      onClick={(e) => {
        onClick?.(e)
        setOpen(false)
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}
