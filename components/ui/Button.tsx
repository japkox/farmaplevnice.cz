import { ButtonHTMLAttributes, ReactNode, ElementType } from 'react'
import { Loader } from 'lucide-react'
import Link from 'next/link'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  icon?: ReactNode
  as?: ElementType
  to?: string // we'll map this to href
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  icon,
  className = '',
  disabled,
  as: Component = 'button',
  to,
  ...props
}: ButtonProps) {
  const baseStyles =
    'px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors whitespace-nowrap'

  const variantStyles = {
    primary: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400',
    secondary: 'text-gray-700 hover:bg-gray-100 disabled:text-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
  }

  const componentProps = {
    ...props,
    ...(to ? { href: to } : {}), // ✅ map `to` to `href` for Link
    disabled: loading || disabled,
    className: `${baseStyles} ${variantStyles[variant]} ${className}`,
  }

  return (
    <Component {...componentProps}>
      {loading ? (
        <>
          <Loader className="h-5 w-5 animate-spin" />
          Načítání...
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </Component>
  )
}
