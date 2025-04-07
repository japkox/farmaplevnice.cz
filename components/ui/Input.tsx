import { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, } from "react"

type CommonProps = {
  label?: string
  error?: string
  icon?: ReactNode
  className?: string
}

type InputProps = {
  as?: "input"
} & InputHTMLAttributes<HTMLInputElement> &
  CommonProps

type TextareaProps = {
  as: "textarea"
  rows?: number
} & TextareaHTMLAttributes<HTMLTextAreaElement> &
  CommonProps

type Props = InputProps | TextareaProps

export function Input(props: Props) {
  const {
    label,
    error,
    icon,
    className = "",
    as = "input",
    ...rest
  } = props

  const baseInputClasses =
    "w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-2"
  const heightClasses = "h-12"
  const iconClasses = icon ? "pl-10" : ""
  const errorClasses = error ? "border-red-300" : ""

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}

        {as === "textarea" ? (
          (() => {
            const { rows = 3, ...textareaProps } = rest as TextareaProps
            return (
              <textarea
                className={`${baseInputClasses} ${errorClasses} ${className} resize-none px-3`}
                rows={rows}
                {...textareaProps}
              />
            )
          })()
        ) : (
          <input
            className={`${baseInputClasses} ${heightClasses} ${iconClasses} ${errorClasses} ${className}`}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
