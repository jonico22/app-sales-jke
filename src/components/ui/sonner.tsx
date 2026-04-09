import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      richColors
      className="toaster group font-body"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-foreground group-[.toaster]:border-border/80 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3 font-body",
          title: "group-[.toast]:text-[13px] group-[.toast]:font-semibold group-[.toast]:tracking-[0.01em]",
          description: "group-[.toast]:text-[12px] group-[.toast]:font-medium group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-semibold group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-semibold group-[.toast]:rounded-lg",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
