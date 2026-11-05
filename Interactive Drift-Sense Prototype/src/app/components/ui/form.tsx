"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Loader2Icon } from "lucide-react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  useWatch,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "./utils";
import { Label } from "./label";
import { Button } from "./button";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

type FormItemContextValue = {
  id: string;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();

  if (!fieldContext.name) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  const { id, hasDescription } = itemContext;

  return {
    id,
    name: fieldContext.name,
    hasDescription: !!hasDescription,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();
  const [hasDescription, setHasDescription] = React.useState(false);

  const value = React.useMemo(
    () => ({ id, hasDescription, setHasDescription }),
    [id, hasDescription],
  );

  return (
    <FormItemContext.Provider value={value}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

/** Visual asterisk. Hidden from screen readers; use `required` on FormLabel for aria. */
function FormRequiredMark({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="form-required-mark"
      className={cn("text-destructive ml-0.5", className)}
      {...props}
    >
      *
    </span>
  );
}

function FormLabel({
  className,
  required = false,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  /** Shows an asterisk after the label */
  required?: boolean;
}) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {required && <FormRequiredMark />}
    </Label>
  );
}

function FormControl({
  required,
  ...props
}: React.ComponentProps<typeof Slot> & {
  /** Sets aria-required on the control */
  required?: boolean;
}) {
  const { error, formItemId, formDescriptionId, formMessageId, hasDescription } =
    useFormField();

  const describedBy =
    [hasDescription ? formDescriptionId : null, error ? formMessageId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={describedBy}
      aria-invalid={!!error}
      aria-required={required || undefined}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();
  const { setHasDescription } = React.useContext(FormItemContext);

  React.useEffect(() => {
