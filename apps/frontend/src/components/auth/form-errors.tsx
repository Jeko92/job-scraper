interface FormErrorsProps {
  errors: string[];
}

export function FormErrors({ errors }: FormErrorsProps) {
  return (
    <div
      role="alert"
      className="space-y-1 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
    >
      {errors.map((error) => (
        <p key={error}>{error}</p>
      ))}
    </div>
  );
}
