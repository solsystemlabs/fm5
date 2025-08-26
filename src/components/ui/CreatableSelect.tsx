import { type ReactNode, useState } from "react";
import {
  Select,
  ListBox,
  ListBoxItem,
  SelectValue,
  Button as AriaButton,
  Popover,
  Label,
  TextField,
} from "react-aria-components";
import { ChevronDownIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import FMInput from "./FMInput";

export type CreatableSelectItem = {
  id: string | number;
  name: string;
};

export type CreatableSelectProps<T extends CreatableSelectItem> = {
  items: T[];
  isLoading?: boolean;
  selectedKey: string | number | null;
  onSelectionChange: (key: string | number) => void;
  onCreateItem: (name: string) => Promise<T>;
  isCreating?: boolean;
  placeholder: string;
  label: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  createLabel: string; // e.g., "Create new brand"
  children?: ReactNode;
};

export default function CreatableSelect<T extends CreatableSelectItem>({
  items,
  isLoading,
  selectedKey,
  onSelectionChange,
  onCreateItem,
  isCreating,
  placeholder,
  label,
  isRequired,
  isInvalid,
  createLabel,
  children,
}: CreatableSelectProps<T>): ReactNode {
  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const [createValue, setCreateValue] = useState("");

  const handleCreateSubmit = async () => {
    if (!createValue.trim()) return;
    
    try {
      const newItem = await onCreateItem(createValue.trim());
      onSelectionChange(newItem.id);
      setCreateValue("");
      setIsCreatingMode(false);
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error("Failed to create item:", error);
    }
  };

  const handleCreateCancel = () => {
    setCreateValue("");
    setIsCreatingMode(false);
  };

  return (
    <div>
      <Label className="block text-sm font-medium text-foreground">
        {label} {isRequired && "*"}
      </Label>
      <Select
        isRequired={isRequired}
        selectedKey={selectedKey}
        onSelectionChange={(key) => {
          if (key === "CREATE_NEW") {
            setIsCreatingMode(true);
          } else {
            onSelectionChange(key as string | number);
          }
        }}
        isInvalid={isInvalid}
      >
        <AriaButton className="relative mt-1 w-full cursor-default rounded-md border border-input bg-background py-2 pr-10 pl-3 text-left shadow-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none sm:text-sm text-foreground">
          <SelectValue className="block truncate">
            {({ isPlaceholder, selectedText }) =>
              isPlaceholder ? placeholder : selectedText
            }
          </SelectValue>
          <ChevronDownIcon
            className="pointer-events-none absolute inset-y-0 top-1/2 right-0 mr-2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground"
            aria-hidden="true"
          />
        </AriaButton>
        <Popover className="ring-opacity-5 mt-1 max-h-60 w-[var(--trigger-width)] overflow-auto rounded-md bg-popover py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm border border-border">
          <ListBox>
            {isCreatingMode ? (
              <div className="p-2 space-y-2">
                <TextField value={createValue} onChange={setCreateValue}>
                  <FMInput placeholder="Enter name..." autoFocus />
                </TextField>
                <div className="flex gap-2 justify-end">
                  <AriaButton
                    className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-gray-600 dark:text-muted-foreground dark:hover:text-gray-200"
                    onPress={handleCreateCancel}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </AriaButton>
                  <AriaButton
                    className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-gray-600 dark:text-muted-foreground dark:hover:text-gray-200 disabled:opacity-50"
                    onPress={handleCreateSubmit}
                    isDisabled={!createValue.trim() || isCreating}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </AriaButton>
                </div>
              </div>
            ) : (
              <>
                <ListBoxItem
                  key="CREATE_NEW"
                  id="CREATE_NEW"
                  className="relative cursor-pointer py-2 pr-9 pl-3 text-popover-foreground select-none hover:bg-accent hover:text-accent-foreground border-b border-border font-medium"
                >
                  + {createLabel}
                </ListBoxItem>
                {isLoading ? (
                  <ListBoxItem
                    key="loading"
                    id="loading"
                    className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-muted-foreground"
                  >
                    Loading...
                  </ListBoxItem>
                ) : items.length > 0 ? (
                  items.map((item) => (
                    <ListBoxItem
                      key={item.id}
                      id={item.id}
                      className="relative cursor-default py-2 pr-9 pl-3 text-popover-foreground select-none hover:bg-accent hover:text-accent-foreground"
                    >
                      {item.name}
                    </ListBoxItem>
                  ))
                ) : (
                  <ListBoxItem
                    key="no-items"
                    id="no-items"
                    className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-muted-foreground"
                  >
                    No items available
                  </ListBoxItem>
                )}
              </>
            )}
          </ListBox>
        </Popover>
      </Select>
      {children}
    </div>
  );
}