import * as React from "react"
import { cn } from "@/lib/utils"

type SwitchProps = React.InputHTMLAttributes<HTMLInputElement>

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, ...props }, ref) => {
    return (
      <label className={cn("relative inline-flex items-center cursor-pointer", className)}>
        <input 
          type="checkbox" 
          role="switch"
          className="sr-only peer"
          ref={ref}
          checked={checked}
          {...props}
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0ea5e9]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ea5e9]"></div>
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
