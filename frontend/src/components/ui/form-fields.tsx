import * as React from "react"
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form"
import {
  CircleHelp,
  Check,
  ChevronsUpDown,
  Search,
  Loader2,
  Upload,
  File as FileIcon,
  Plus,
  X,
} from "lucide-react"
import { debounce } from "lodash"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getImageUrl } from "@/lib/utils"
/**
 * Reusable form field components for react-hook-form
 * Use these components in any form to standardize field rendering
 */

// ============================================================================
// FormField Component
// ============================================================================

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  tooltip?: string
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  inputType?: string
  min?: string
  step?: string
  error?: string
}

/**
 * Generic text/number input field with label
 * @example
 * <FormField
 *   control={control}
 *   name="email"
 *   label="Email Address"
 *   inputType="email"
 *   required
 * />
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  tooltip,
  placeholder,
  required,
  readOnly,
  inputType,
  min,
  step,
  error,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <FieldLabel
            htmlFor={String(name)}
            label={label}
            required={required}
            tooltip={tooltip}
          />
          <Input
            id={String(name)}
            {...field}
            type={inputType}
            min={min}
            step={step}
            placeholder={placeholder}
            readOnly={readOnly}
            required={required}
            disabled={readOnly}
            className={cn(
              readOnly && "bg-muted/30 opacity-90",
              error && "border-destructive"
            )}
            aria-invalid={!!error}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    />
  )
}

// ============================================================================
// FormSelectField Component
// ============================================================================

interface FormSelectFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  tooltip?: string
  options: Array<{ label: string; value: string }>
  disabled?: boolean
  readOnly?: boolean
  error?: string
  placeholder?: string
  required?: boolean
  action?: React.ReactNode
}

/**
 * Generic select/dropdown field
 * @example
 * <FormSelectField
 *   control={control}
 *   name="status"
 *   label="Status"
 *   options={[
 *     { label: "Active", value: "active" },
 *     { label: "Inactive", value: "inactive" },
 *   ]}
 * />
 */
export function FormSelectField<T extends FieldValues>({
  control,
  name,
  label,
  tooltip,
  options,
  disabled,
  readOnly,
  error,
  placeholder,
  required,
  action,
}: FormSelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel
              htmlFor={String(name)}
              label={label}
              required={required}
              tooltip={tooltip}
            />
            {action}
          </div>
          <select
            id={String(name)}
            {...field}
            disabled={disabled || readOnly}
            className={cn(
              "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-100",
              readOnly && "bg-muted/30 opacity-90",
              error && "border-destructive"
            )}
            aria-invalid={!!error}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    />
  )
}

// ============================================================================
// FormTextarea Component
// ============================================================================

interface FormTextareaProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  tooltip?: string
  placeholder?: string
  readOnly?: boolean
  rows?: number
  error?: string
  required?: boolean
}

/**
 * Generic textarea field
 * @example
 * <FormTextarea
 *   control={control}
 *   name="description"
 *   label="Description"
 *   rows={5}
 *   required
 * />
 */
export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  tooltip,
  placeholder,
  readOnly,
  rows,
  error,
  required,
}: FormTextareaProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <FieldLabel
            htmlFor={String(name)}
            label={label}
            required={required}
            tooltip={tooltip}
          />
          <textarea
            id={String(name)}
            {...field}
            placeholder={placeholder}
            readOnly={readOnly}
            rows={rows}
            disabled={readOnly}
            className={cn(
              "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              readOnly && "cursor-default bg-muted/30 opacity-90",
              error && "border-destructive"
            )}
            aria-invalid={!!error}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    />
  )
}

// ============================================================================
// FormCheckbox Component (Bonus)
// ============================================================================

interface FormCheckboxProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  error?: string
  disabled?: boolean
}

/**
 * Generic checkbox field
 * @example
 * <FormCheckbox
 *   control={control}
 *   name="agreeToTerms"
 *   label="I agree to the terms and conditions"
 * />
 */
export function FormCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  error,
  disabled,
}: FormCheckboxProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              id={String(name)}
              type="checkbox"
              {...field}
              checked={field.value as boolean}
              disabled={disabled}
              className="h-4 w-4 rounded border border-input"
              aria-invalid={!!error}
            />
            <Label htmlFor={String(name)} className="cursor-pointer">
              {label}
            </Label>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    />
  )
}

// ============================================================================
// FormSwitch Component
// ============================================================================

interface FormSwitchProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  description?: string
  error?: string
  disabled?: boolean
}

/**
 * Generic switch/toggle field with label and optional description
 */
export function FormSwitch<T extends FieldValues>({
  control,
  name,
  label,
  description,
  error,
  disabled,
}: FormSwitchProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm transition-colors hover:bg-muted/10">
          <div className="space-y-0.5">
            <Label
              htmlFor={String(name)}
              className="cursor-pointer text-base font-semibold"
            >
              {label}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Switch
            id={String(name)}
            checked={field.value as boolean}
            onCheckedChange={field.onChange}
            disabled={disabled}
            aria-invalid={!!error}
          />
        </div>
      )}
    />
  )
}

// ============================================================================
// Helper Components
// ============================================================================

type FieldLabelProps = {
  htmlFor: string
  label: string
  required?: boolean
  tooltip?: string
  action?: React.ReactNode
}

function FieldLabel({
  htmlFor,
  label,
  required,
  tooltip,
  action,
}: FieldLabelProps) {
  return (
    <div className="flex min-h-5 items-center gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex cursor-help text-muted-foreground">
                <CircleHelp className="size-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
      {action}
    </div>
  )
}

// ============================================================================
// FormSearchSelect Component
// ============================================================================

interface FormSearchSelectProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  loading?: boolean
  options: Array<{ label: string; value: string }>
  onSearch: (value: string) => void
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  error?: string
  tooltip?: string
  labelAction?: React.ReactNode
}

/**
 * Searchable select component for server-side search
 */
export function FormSearchSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Search...",
  loading,
  options,
  onSearch,
  required,
  disabled,
  readOnly,
  error,
  tooltip,
  labelAction,
}: FormSearchSelectProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const debouncedSearch = React.useMemo(
    () => debounce((value: string) => onSearch(value), 500),
    [onSearch]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    debouncedSearch(value)
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <FieldLabel
            htmlFor={String(name)}
            label={label}
            required={required}
            tooltip={tooltip}
            action={labelAction}
          />

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled || readOnly}
                className={cn(
                  "h-8 w-full justify-between rounded-lg px-3 font-normal",
                  !field.value && "text-muted-foreground",
                  readOnly && "bg-muted/30 opacity-90",
                  error && "border-destructive"
                )}
              >
                <span className="truncate">
                  {field.value
                    ? options.find((option) => option.value === field.value)
                        ?.label || field.value
                    : placeholder}
                </span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[--radix-popover-trigger-width] p-0"
              align="start"
            >
              <div className="flex flex-col">
                <div className="flex items-center border-b px-3 py-2">
                  <Search className="mr-2 size-4 shrink-0 opacity-50" />
                  <input
                    className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Type to search..."
                    value={searchValue}
                    onChange={handleSearchChange}
                  />
                  {loading && (
                    <Loader2 className="ml-2 size-4 animate-spin opacity-50" />
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                  {options.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No results found.
                    </div>
                  ) : (
                    options.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                          field.value === option.value &&
                            "bg-accent text-accent-foreground"
                        )}
                        onClick={() => {
                          field.onChange(option.value)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === option.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    />
  )
}

// ============================================================================
// FormFileUpload Component
// ============================================================================

interface FormFileUploadProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  tooltip?: string
  accept?: string
  maxSizeText?: string
  required?: boolean
  error?: string
  disabled?: boolean
  uploadFile?: (file: File) => Promise<string>
  onUploadingChange?: (uploading: boolean) => void
  onUploadError?: (error: unknown) => void
}

/**
 * Generic file upload component
 */
export function FormFileUpload<T extends FieldValues>({
  control,
  name,
  label,
  tooltip,
  accept,
  maxSizeText,
  required,
  error,
  disabled,
  uploadFile,
  onUploadingChange,
  onUploadError,
}: FormFileUploadProps<T>) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [localPreviewUrl, setLocalPreviewUrl] = React.useState<string | null>(
    null
  )
  const isImage = accept?.includes("image")

  React.useEffect(() => {
    return () => {
      if (localPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl)
      }
    }
  }, [localPreviewUrl])

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, ref, ...field } }) => {
        // Generate preview URL if it's a file and an image
        const previewUrl = React.useMemo(() => {
          if (localPreviewUrl) return localPreviewUrl
          if (!value) return null
          if (typeof value === "string") return getImageUrl(value)
          if ((value as any) instanceof File && isImage) {
            return URL.createObjectURL(value as File)
          }
          return null
        }, [value, isImage, localPreviewUrl])

        // Cleanup object URL
        React.useEffect(() => {
          return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) {
              URL.revokeObjectURL(previewUrl)
            }
          }
        }, [previewUrl])

        return (
          <div className="space-y-2">
            {label && (
              <FieldLabel
                htmlFor={String(name)}
                label={label}
                required={required}
                tooltip={tooltip}
              />
            )}
            <input
              {...field}
              type="file"
              ref={(e) => {
                // @ts-ignore
                ref?.(e)
                // @ts-ignore
                fileInputRef.current = e
              }}
              className="hidden"
              accept={accept}
              disabled={disabled}
              onChange={async (e) => {
                const file = e.target.files?.[0] || null
                if (!file) {
                  onChange(null)
                  return
                }

                if (!uploadFile) {
                  onChange(file)
                  return
                }

                try {
                  const objectUrl =
                    isImage && file ? URL.createObjectURL(file) : null
                  if (objectUrl) setLocalPreviewUrl(objectUrl)

                  setIsUploading(true)
                  onUploadingChange?.(true)

                  const uploadedUrl = await uploadFile(file)
                  if (objectUrl) {
                    URL.revokeObjectURL(objectUrl)
                    setLocalPreviewUrl(null)
                  }
                  onChange(uploadedUrl)
                } catch (uploadError) {
                  console.error(uploadError)
                  onUploadError?.(uploadError)
                  onChange(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                  if (localPreviewUrl?.startsWith("blob:")) {
                    URL.revokeObjectURL(localPreviewUrl)
                  }
                  setLocalPreviewUrl(null)
                } finally {
                  setIsUploading(false)
                  onUploadingChange?.(false)
                }
              }}
            />
            <div
              onClick={() => !disabled && fileInputRef.current?.click()}
              className={cn(
                "group relative flex h-32 w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted/50 transition-all",
                !disabled
                  ? "cursor-pointer hover:border-primary/50 hover:bg-muted"
                  : "cursor-not-allowed opacity-50",
                error && "border-destructive hover:border-destructive",
                isUploading && "cursor-wait opacity-80"
              )}
            >
              {" "}
              {value && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()

                    onChange(null)

                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }

                    if (localPreviewUrl?.startsWith("blob:")) {
                      URL.revokeObjectURL(localPreviewUrl)
                    }

                    setLocalPreviewUrl(null)
                  }}
                  className="absolute top-2 right-2 z-50 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isUploading ? (
                <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <Upload className="size-6 animate-pulse text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    Uploading...
                  </span>
                </div>
              ) : null}
              {value ? (
                isImage && previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                    {!disabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Upload className="size-6 text-white" />
                      </div>
                    )}
                  </>
                ) : disabled ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
                    <FileIcon className="size-8 text-primary" />
                    <div className="space-y-1">
                      <span className="block max-w-[240px] truncate text-sm font-medium text-foreground">
                        {typeof value === "string"
                          ? value.split("/").pop()
                          : (value as File).name}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Uploaded document
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        const url =
                          typeof value === "string" ? getImageUrl(value) : null
                        if (url) {
                          window.open(url, "_blank", "noopener,noreferrer")
                        }
                      }}
                    >
                      View Document
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
                    <FileIcon className="size-8 text-primary" />
                    <span className="max-w-[200px] truncate text-sm font-medium text-foreground">
                      {typeof value === "string" ? value : (value as File).name}
                    </span>
                    {(value as any) instanceof File && (
                      <span className="text-xs text-muted-foreground">
                        {((value as File).size / 1024).toFixed(2)} KB
                      </span>
                    )}
                  </div>
                )
              ) : (
                <>
                  <div className="flex flex-col items-center">
                    <Upload className="mb-2 size-6 text-muted-foreground transition-colors group-hover:text-primary" />
                    <span className="text-xs font-semibold text-primary">
                      {disabled ? "No File" : "Click to Browse File"}
                    </span>
                  </div>
                  {maxSizeText && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {maxSizeText}
                    </p>
                  )}
                </>
              )}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        )
      }}
    />
  )
}

// ============================================================================
// FormCreatableSelect Component
// ============================================================================

interface FormCreatableSelectProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  options: Array<{ label: string; value: string }>
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  error?: string
  tooltip?: string
  searchValue?: string
  onSearchChange?: (val: string) => void
}

/**
 * Searchable select component that allows adding a custom option if not found
 */
export function FormCreatableSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Select or enter...",
  options,
  required,
  disabled,
  readOnly,
  error,
  tooltip,
  searchValue,
  onSearchChange,
}: FormCreatableSelectProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [internalSearch, setInternalSearch] = React.useState("")

  const isControlledSearch =
    searchValue !== undefined && onSearchChange !== undefined
  const currentSearch = isControlledSearch ? searchValue : internalSearch
  const setCurrentSearch = isControlledSearch
    ? onSearchChange
    : setInternalSearch

  const filteredOptions = React.useMemo(() => {
    if (isControlledSearch) return options

    if (!currentSearch) return options
    const lowerVal = currentSearch.toLowerCase()
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(lowerVal) ||
        option.value.toLowerCase().includes(lowerVal)
    )
  }, [options, currentSearch, isControlledSearch])

  const showCreateOption = React.useMemo(() => {
    if (!currentSearch) return false
    const exactMatch = options.some(
      (opt) => opt.value.toLowerCase() === currentSearch.toLowerCase()
    )
    return !exactMatch
  }, [options, currentSearch])

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <FieldLabel
            htmlFor={String(name)}
            label={label}
            required={required}
            tooltip={tooltip}
          />

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled || readOnly}
                className={cn(
                  "h-8 w-full justify-between rounded-lg px-3 font-normal",
                  !field.value && "text-muted-foreground",
                  readOnly && "bg-muted/30 opacity-90",
                  error && "border-destructive"
                )}
              >
                <span className="truncate">
                  {field.value
                    ? options.find((option) => option.value === field.value)
                        ?.label || field.value
                    : placeholder}
                </span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[--radix-popover-trigger-width] p-0"
              align="start"
            >
              <div className="flex flex-col">
                <div className="flex items-center border-b px-3 py-2">
                  <Search className="mr-2 size-4 shrink-0 opacity-50" />
                  <input
                    className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Search or type custom..."
                    value={currentSearch}
                    onChange={(e) => setCurrentSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                  {filteredOptions.length === 0 && !showCreateOption ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No results found.
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                          field.value === option.value &&
                            "bg-accent text-accent-foreground"
                        )}
                        onClick={() => {
                          field.onChange(option.value)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === option.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </div>
                    ))
                  )}
                  {showCreateOption && (
                    <div
                      className="relative mt-1 flex cursor-pointer items-center rounded-sm border-t px-2 py-1.5 text-sm font-medium text-primary outline-none select-none hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        field.onChange(currentSearch)
                        setOpen(false)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add custom HSN: "{currentSearch}"
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    />
  )
}
