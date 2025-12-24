import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "bg-background text-foreground",
    destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
    warning: "border-yellow-500/50 text-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 [&>svg]:text-yellow-600",
  }

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }

