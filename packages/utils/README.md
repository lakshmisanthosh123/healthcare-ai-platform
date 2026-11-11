# @healthcare-ai-platform/utils

Common utility helpers used across microfrontends.

## Contents

- `src/dateFormatter.ts` - Date formatting helper.
- `src/currencyFormatter.ts` - Currency formatting helper.
- `src/apiHelper.ts` - Simple fetch-based API helper.
- `src/storageHelper.ts` - Safe localStorage wrapper.
- `src/constants.ts` - App constants and storage keys.
- `src/logger.ts` - Lightweight logger wrapper.
- `src/index.ts` - Re-exports all helpers.

## Installation

No runtime dependencies. Import functions directly from the package.

```ts
import { formatDate, formatCurrency } from "@healthcare-ai-platform/utils";
```

## Example

```ts
import { formatDate, formatCurrency } from "@healthcare-ai-platform/utils";

formatDate(new Date());
formatCurrency(12.5, "USD");
```
