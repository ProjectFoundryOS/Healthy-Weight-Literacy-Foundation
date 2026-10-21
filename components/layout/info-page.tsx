import type { ReactNode } from "react"
import { PageHeader } from "./page-header"
import { Section } from "./section"
import { Container } from "./container"

export function InfoPage({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ label: title }]}
      />
      <Section>
        <Container className="max-w-3xl">
          <div className="prose text-lg">{children}</div>
        </Container>
      </Section>
    </>
  )
}
