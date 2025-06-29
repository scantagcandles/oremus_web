import React from "react";
import { inputBase, labelBase, errorMessageBase } from "./utils";
import { twMerge } from "tailwind-merge";
import { VariantProps } from "class-variance-authority";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputBase> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      rounded = "lg",
      state,
      label,
      error,
      hint,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={twMerge(
              labelBase({ variant, size }),
              required && 'after:content-["*"] after:ml-0.5 after:text-red-400'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative mt-1">
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              inputBase({
                variant,
                size,
                rounded,
                state: error ? "error" : state,
              }),
              className
            )}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            aria-invalid={error ? "true" : "false"}
            required={required}
            {...props}
          />
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className={errorMessageBase({ variant })}
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && hint && (
          <p
            id={`${inputId}-hint`}
            className={twMerge(
              labelBase({ variant, size: "sm" }),
              "mt-1 opacity-80"
            )}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
