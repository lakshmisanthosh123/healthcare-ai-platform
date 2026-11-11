# @healthcare-ai-platform/validation

A reusable Zod validation package for React TypeScript microfrontend apps.

## Package Contents

- `src/login.schema.ts`
- `src/register.schema.ts`
- `src/patient.schema.ts`
- `src/doctor.schema.ts`
- `src/appointment.schema.ts`
- `src/admin.schema.ts`
- `src/index.ts`

## Installation

Install the peer dependency in each app:

```bash
pnpm add zod
```

If you use React Hook Form with Zod, also install:

```bash
pnpm add react-hook-form @hookform/resolvers
```

## Exports

```ts
export { loginSchema, type LoginFormValues } from "./login.schema";
export { registerSchema, type RegisterFormValues } from "./register.schema";
export { patientSchema, type PatientFormValues } from "./patient.schema";
export { doctorSchema, type DoctorFormValues } from "./doctor.schema";
export {
  appointmentSchema,
  type AppointmentFormValues,
} from "./appointment.schema";
export { adminSchema, type AdminFormValues } from "./admin.schema";
```

## Example usage with React Hook Form

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  type LoginFormValues,
} from "@healthcare-ai-platform/validation";

const LoginForm = () => {
  const { register, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    console.log("Login values", values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>Email</label>
      <input type="email" {...register("email")} />
      {formState.errors.email ? <p>{formState.errors.email.message}</p> : null}

      <label>Password</label>
      <input type="password" {...register("password")} />
      {formState.errors.password ? (
        <p>{formState.errors.password.message}</p>
      ) : null}

      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;
```

## How each module imports the validation package

### Shell

The shell can import shared schemas if it needs authentication or admin validation logic:

```ts
import {
  loginSchema,
  registerSchema,
} from "@healthcare-ai-platform/validation";
```

### Auth

Auth modules use login and register schemas:

```ts
import {
  loginSchema,
  registerSchema,
} from "@healthcare-ai-platform/validation";
```

### Dashboard

Dashboard may use validation for admin or appointment forms:

```ts
import {
  appointmentSchema,
  adminSchema,
} from "@healthcare-ai-platform/validation";
```

### Patient

Patient module can use patient and appointment schemas:

```ts
import {
  patientSchema,
  appointmentSchema,
} from "@healthcare-ai-platform/validation";
```

### Doctor

Doctor module may use doctor and appointment schemas:

```ts
import {
  doctorSchema,
  appointmentSchema,
} from "@healthcare-ai-platform/validation";
```

### Admin

Admin module can use admin and doctor schemas:

```ts
import { adminSchema, doctorSchema } from "@healthcare-ai-platform/validation";
```
