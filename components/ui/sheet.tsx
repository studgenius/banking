"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// --------------------
// VisuallyHidden Component
// --------------------
const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(function VisuallyHidden({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={cn(
        "absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 -m-px",
        className
      )}
      style={{ clip: "rect(0, 0, 0, 0)", clipPath: "inset(50%)" }}
      {...props}
    />
  )
})

// --------------------
// Helper to find SheetTitle text recursively
// --------------------
const findSheetTitleText = (nodes: React.ReactNode): string | undefined => {
  for (const child of React.Children.toArray(nodes)) {
    if (!React.isValidElement(child)) continue

    const element = child as React.ReactElement<{ children?: React.ReactNode }>
    const childType = (element.type as { displayName?: string }).displayName

    if (childType === "SheetTitle") {
      const text = React.Children.toArray(element.props.children)
        .filter((c): c is string => typeof c === "string")
        .join("")
        .trim()

      if (text) return text
    }

    if (element.props.children) {
      const nested = findSheetTitleText(element.props.children)
      if (nested) return nested
    }
  }

  return undefined
}

// --------------------
// Sheet Root / Trigger / Close / Portal
// --------------------
function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(
  props: React.ComponentProps<typeof SheetPrimitive.Trigger>
) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(
  props: React.ComponentProps<typeof SheetPrimitive.Close>
) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal(
  props: React.ComponentProps<typeof SheetPrimitive.Portal>
) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

// --------------------
// Sheet Overlay
// --------------------
function SheetOverlay(
  { className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>
) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

// --------------------
// Sheet Side types
// --------------------
type SheetSide = "top" | "right" | "bottom" | "left"

const sideClasses: Record<SheetSide, string> = {
  right: "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
  left: "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
  top: "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
  bottom: "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
}

// --------------------
// Sheet Content
// --------------------
function SheetContent({
  className,
  children,
  side = "right",
  title,
  autoFocus = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: SheetSide
  title?: string
  autoFocus?: boolean
}) {
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Determine the accessible title
  const accessibleTitle = title ?? findSheetTitleText(children) ?? "Sheet dialog"

  // Generate ID for aria-describedby if a SheetDescription exists
  const descriptionIdRef = React.useRef<string | null>(null)
  React.useEffect(() => {
    const descriptionElement = contentRef.current?.querySelector<HTMLElement>(
      '[data-slot="sheet-description"]'
    )
    if (descriptionElement) {
      if (!descriptionElement.id) descriptionElement.id = `sheet-desc-${crypto.randomUUID()}`
      descriptionIdRef.current = descriptionElement.id
    } else {
      descriptionIdRef.current = null
    }
  }, [children])

  // Auto-focus first focusable element
  React.useEffect(() => {
    if (!autoFocus || !contentRef.current) return

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ]
    const firstFocusable: HTMLElement | null = contentRef.current.querySelector(
      focusableSelectors.join(",")
    )
    firstFocusable?.focus()
  }, [autoFocus])

  // Focus trap & Escape key handling
  React.useEffect(() => {
    if (!contentRef.current) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const isTab = event.key === "Tab"
      const isEscape = event.key === "Escape" || event.key === "Esc"

      if (isEscape) {
        event.preventDefault()
        const closeButton = contentRef.current?.querySelector<HTMLButtonElement>(
          '[data-slot="sheet-close"]'
        )
        closeButton?.click()
        return
      }

      if (!isTab) return

      const focusableElements = Array.from(
        contentRef.current!.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null)

      if (focusableElements.length === 0) return

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        last.focus()
        event.preventDefault()
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus()
        event.preventDefault()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        data-slot="sheet-overlay"
        className="data-[state=open]:animate-in data-[state=closed]:animate-out fixed inset-0 z-50 bg-black/50"
      />
      <SheetPrimitive.Content
        ref={contentRef}
        data-slot="sheet-content"
        aria-describedby={descriptionIdRef.current ?? undefined}
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          sideClasses[side],
          className
        )}
        {...props}
      >
        {/* Single accessible title */}
        <VisuallyHidden>
          <SheetPrimitive.Title>{accessibleTitle}</SheetPrimitive.Title>
        </VisuallyHidden>

        {children}

        <SheetPrimitive.Close
          data-slot="sheet-close"
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}
SheetContent.displayName = "SheetContent"

// --------------------
// Sheet Header / Footer
// --------------------
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

// --------------------
// Sheet Title / Description
// --------------------
function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}
SheetTitle.displayName = "SheetTitle"

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

// --------------------
// Exports
// --------------------
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
