import type React from "react"
import { Container } from "./container"
import { Breadcrumbs, type BreadcrumbItem } from "./breadcrumbs"

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  children?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  children,
}: PageHeaderProps) {
  return (
    <div className="bg-[#F1F4ED] py-8 sm:py-12">
      <Container>
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-4" />}
        <h1 className="text-3xl font-semibold tracking-[-0.035em] text-secondary sm:text-4xl lg:text-[2.75rem] text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground text-pretty">
            {description}
          </p>
        )}
        {children}
      </Container>
    </div>
  )
}
