import React from "react"

type ElementType = React.ElementType

type CardShellProps<T extends ElementType = "div"> = {
  as?: T
  children: React.ReactNode
  className?: string
  fullHeight?: boolean
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">

const BASE_CARD_CLASSES = [
  "card",
  "bg-base-200/80",
  "text-base-content",
  "border",
  "border-base-content/10",
  "shadow-lg",
  "backdrop-blur",
]
  .filter(Boolean)
  .join(" ")

export default function CardShell<T extends ElementType = "div">({
  as,
  children,
  className = "",
  fullHeight = false,
  ...rest
}: CardShellProps<T>) {
  const Component = as ?? "div"
  const combinedClassName = [BASE_CARD_CLASSES, fullHeight ? "h-full" : "", className]
    .filter(Boolean)
    .join(" ")

  return (
    <Component className={combinedClassName} {...rest}>
      {children}
    </Component>
  )
}
