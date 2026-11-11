# UI Package Usage

This package exports reusable React components from `@healthcare-ai-platform/ui`.

## Example Import

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

## Example Component

```tsx
import React, { useState } from "react";
import {
  Button,
  Input,
  Modal,
  Card,
  Search,
  Dropdown,
  Pagination,
} from "@healthcare-ai-platform/ui";

const Example = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [dropdownValue, setDropdownValue] = useState("option1");
  const [page, setPage] = useState(1);

  return (
    <div style={{ padding: 24 }}>
      <Search
        value={searchValue}
        onChange={setSearchValue}
        onSearch={() => console.log("Search", searchValue)}
      />
      <Card
        title="Example Card"
        description="This is a shared UI card component."
      >
        <p>This card shows how to use shared UI components.</p>
        <Button label="Open Modal" onClick={() => setModalOpen(true)} />
      </Card>

      <Modal
        isOpen={modalOpen}
        title="Example Modal"
        onClose={() => setModalOpen(false)}
        footer={<Button label="Close" onClick={() => setModalOpen(false)} />}
      >
        <p>Use this modal for confirmation or details.</p>
      </Modal>

      <Dropdown
        label="Select option"
        options={[
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ]}
        value={dropdownValue}
        onChange={setDropdownValue}
      />

      <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
    </div>
  );
};

export default Example;
```

## App Import Guidance

Use the UI package in each app by installing package dependencies and importing from the package path.

### Shell

```tsx
import { Button, Loader } from "@healthcare-ai-platform/ui";
```

### Auth

```tsx
import { Input, Button, Modal } from "@healthcare-ai-platform/ui";
```

### Dashboard

```tsx
import { Card, Table, Pagination, Search } from "@healthcare-ai-platform/ui";
```

### Patient

```tsx
import { Card, Input, Button, Dropdown } from "@healthcare-ai-platform/ui";
```

### Doctor

```tsx
import { Table, Loader, Button, Modal } from "@healthcare-ai-platform/ui";
```

### Admin

```tsx
import { Search, Table, Dropdown, Button } from "@healthcare-ai-platform/ui";
```

```

```
