'use client';

import { useActionState } from 'react';

import { FormErrors } from '@/components/auth/form-errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register } from '@/lib/auth/actions';

interface RegisterFormProps {
  passwordMinLength: number | undefined;
}

export function RegisterForm({ passwordMinLength }: RegisterFormProps) {
  const [state, formAction, pending] = useActionState(register, undefined);

  return (
    <form action={formAction} className="space-y-6">
      {state && <FormErrors errors={state.errors} />}

      <div className="space-y-2">
        <Label htmlFor="firstName">First name</Label>
        <Input
          id="firstName"
          name="firstName"
          autoComplete="given-name"
          defaultValue={state?.values.firstName}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last name</Label>
        <Input
          id="lastName"
          name="lastName"
          autoComplete="family-name"
          defaultValue={state?.values.lastName}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          defaultValue={state?.values.username}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={passwordMinLength}
          required
        />
        {passwordMinLength !== undefined && (
          <p className="text-xs text-muted-foreground">
            At least {passwordMinLength} characters.
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
