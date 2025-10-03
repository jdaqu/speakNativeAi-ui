import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type CardProps,
  type CardTitleProps
} from "../primitives/card"
import { Button } from "../primitives/button"
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react"

// FormCard - For input forms with built-in footer and error handling
export interface FormCardProps extends Omit<CardProps, 'padding'> {
  title?: string
  description?: string
  children: React.ReactNode
  // Button configuration
  primaryButton: {
    label: string
    loadingLabel?: string
    isLoading?: boolean
    isDisabled?: boolean
    onClick?: () => void
    form?: string
    type?: 'button' | 'submit'
  }
  secondaryButton?: {
    label: string
    onClick: () => void
    showWhen?: boolean
  }
  // Error handling
  error?: string | React.ReactNode
}

export const FormCard = React.forwardRef<HTMLDivElement, FormCardProps>(
  ({
    title,
    description,
    children,
    primaryButton,
    secondaryButton,
    error,
    className,
    ...props
  }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn("", className)}
        data-preset="form-card"
        {...props}
      >
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          {children}

          {/* Error Display */}
          {error && (
            <div className="mt-4">
              <ErrorCard error={error} />
            </div>
          )}
        </CardContent>

        {/* Footer with Buttons */}
        <CardFooter justify="end">
          <div className="flex space-x-2">
            <Button
              type={primaryButton.type || 'submit'}
              disabled={primaryButton.isLoading || primaryButton.isDisabled}
              onClick={primaryButton.onClick}
              form={primaryButton.form}
            >
              {primaryButton.isLoading ? primaryButton.loadingLabel || 'Loading...' : primaryButton.label}
            </Button>
            {secondaryButton && (secondaryButton.showWhen !== false) && (
              <Button
                type="button"
                variant="outline"
                onClick={secondaryButton.onClick}
              >
                {secondaryButton.label}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    )
  }
)
FormCard.displayName = "FormCard"

// SectionCard - For content sections with optional icon
export interface SectionCardProps extends Omit<CardProps, 'padding'> {
  title?: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  actions?: React.ReactNode
  titleSize?: CardTitleProps['size']
}

export const SectionCard = React.forwardRef<HTMLDivElement, SectionCardProps>(
  ({ title, description, icon, children, actions, titleSize = "default", className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn("", className)}
        data-preset="section-card"
        {...props}
      >
        {(title || description || icon) && (
          <CardHeader>
            {title && (
              <CardTitle size={titleSize} className="flex items-center gap-2">
                {icon}
                <span>{title}</span>
              </CardTitle>
            )}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          {children}
        </CardContent>
        {actions && (
          <CardFooter justify="end">
            {actions}
          </CardFooter>
        )}
      </Card>
    )
  }
)
SectionCard.displayName = "SectionCard"

// StatusCard - For displaying status with appropriate colors and icons
export interface StatusCardProps extends Omit<CardProps, 'padding'> {
  status: 'success' | 'error' | 'warning' | 'info'
  title?: string
  description?: string
  children?: React.ReactNode
  showIcon?: boolean
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    className: "border-green-200 bg-green-50",
    iconClassName: "text-green-500",
    titleClassName: "text-green-900",
    descriptionClassName: "text-green-700"
  },
  error: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50",
    iconClassName: "text-red-500",
    titleClassName: "text-red-900",
    descriptionClassName: "text-red-700"
  },
  warning: {
    icon: AlertTriangle,
    className: "border-yellow-200 bg-yellow-50",
    iconClassName: "text-yellow-500",
    titleClassName: "text-yellow-900",
    descriptionClassName: "text-yellow-700"
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50",
    iconClassName: "text-blue-500",
    titleClassName: "text-blue-900",
    descriptionClassName: "text-blue-700"
  }
}

export const StatusCard = React.forwardRef<HTMLDivElement, StatusCardProps>(
  ({ status, title, description, children, showIcon = true, className, ...props }, ref) => {
    const config = statusConfig[status]
    const IconComponent = config.icon

    return (
      <Card
        ref={ref}
        variant="outline"
        className={cn(config.className, className)}
        data-preset="status-card"
        data-status={status}
        {...props}
      >
        {(title || description) && (
          <CardHeader>
            {title && (
              <CardTitle className={cn("flex items-center gap-2", config.titleClassName)}>
                {showIcon && <IconComponent className={cn("h-5 w-5", config.iconClassName)} />}
                <span>{title}</span>
              </CardTitle>
            )}
            {description && (
              <CardDescription className={config.descriptionClassName}>
                {description}
              </CardDescription>
            )}
          </CardHeader>
        )}
        {children && (
          <CardContent>
            {children}
          </CardContent>
        )}
      </Card>
    )
  }
)
StatusCard.displayName = "StatusCard"

// ResultCard - For displaying before/after comparisons
export interface ResultCardProps extends Omit<CardProps, 'padding'> {
  title?: string
  original?: string
  corrected?: string
  isCorrect?: boolean
  children?: React.ReactNode
  className?: string
}

export const ResultCard = React.forwardRef<HTMLDivElement, ResultCardProps>(
  ({ title, original, corrected, isCorrect, children, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn("", className)}
        data-preset="result-card"
        {...props}
      >
        {title && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span>{title}</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {original && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Original:</p>
              <p className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
                {original}
              </p>
            </div>
          )}
          {corrected && !isCorrect && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Corrected:</p>
              <p className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                {corrected}
              </p>
            </div>
          )}
          {children}
        </CardContent>
      </Card>
    )
  }
)
ResultCard.displayName = "ResultCard"

// ErrorCard - For displaying errors with consistent styling
export interface ErrorCardProps extends Omit<CardProps, 'padding'> {
  error: string | React.ReactNode
  title?: string
}

export const ErrorCard = React.forwardRef<HTMLDivElement, ErrorCardProps>(
  ({ error, title = "Error", className, ...props }, ref) => {
    return (
      <StatusCard
        ref={ref}
        status="error"
        title={title}
        className={className}
        data-preset="error-card"
        {...props}
      >
        <div className="text-sm">
          {typeof error === 'string' ? <p>{error}</p> : error}
        </div>
      </StatusCard>
    )
  }
)
ErrorCard.displayName = "ErrorCard"

