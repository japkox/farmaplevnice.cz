import HeadBase from 'next/head'

export function Head({
  title = 'Farma Plevnice s.r.o.',
  description = 'Tradice, kvalita a udržitelné zemědělství. Nakupujte naše produkty online přímo od farmáře.',
}: {
  title?: string
  description?: string
}) {
  return (
    <HeadBase>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
    </HeadBase>
  )
}