# @healthcare-ai-platform/ui

A shared UI component package for React TypeScript microfrontends.

## Exports

This package exports reusable components for all microfrontends:

- `Button`
- `Input`
- `TextField`
- `Modal`
- `Loader`
- `Card`
- `Table`
- `Pagination`
- `Search`
- `Dropdown`

## Usage

Import components in any app:

```tsx
import {
  Button,
  Input,
  TextField,
  Modal,
  Loader,
  Card,
  Table,
  Pagination,
  Search,
  Dropdown,
} from "@healthcare-ai-platform/ui";
```

## Example

```tsx
import React, { useState } from "react";
import { Button, Modal, Search, Dropdown } from "@healthcare-ai-platform/ui";

const Example = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [value, setValue] = useState("option1");

  return (
    <div style={{ padding: 20 }}>
      <Search
        value={searchValue}
        onChange={setSearchValue}
        onSearch={() => console.log("search", searchValue)}
      />
      <Button label="Open Modal" onClick={() => setIsOpen(true)} />
      <Modal
        isOpen={isOpen}
        title="Example"
        onClose={() => setIsOpen(false)}
        footer={<Button label="Close" onClick={() => setIsOpen(false)} />}
      >
        Modal content here.
      </Modal>
      <Dropdown
        label="Choose option"
        options={[
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ]}
        value={value}
        onChange={setValue}
      />
    </div>
  );
};

export default Example;
```

## App-specific usage

### Shell

```tsx
import { Button, Card, Loader } from "@healthcare-ai-platform/ui";
```

### Auth

```tsx
import { Input, Button, TextField, Modal } from "@healthcare-ai-platform/ui";
```

### Dashboard

```tsx
import { Table, Pagination, Search, Card } from "@healthcare-ai-platform/ui";
```

### Patient

```tsx
import { Card, Input, Dropdown, Button } from "@healthcare-ai-platform/ui";
```

### Doctor

```tsx
import { Table, Loader, Modal, Button } from "@healthcare-ai-platform/ui";
```

### Admin

```tsx
import { Table, Search, Dropdown, Button } from "@healthcare-ai-platform/ui";
```
