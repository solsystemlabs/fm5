import { type ReactNode, useState, useRef } from "react";
import {
  ListBox,
  ListBoxItem,
  Button as AriaButton,
  Popover,
  Label,
  TextField,
  OverlayTriggerStateContext,
} from "react-aria-components";
import { useOverlayTriggerState } from "react-stately";
import {
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import FMInput from "./FMInput";
import clsx from "clsx";

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
  createLabel,
  children,
}: CreatableSelectProps<T>): ReactNode {
  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const [createValue, setCreateValue] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Use React Aria's overlay trigger state
  const state = useOverlayTriggerState({});

  // Find the selected item to display its name
  const selectedItem = items.find((item) => item.id === selectedKey);
  const displayText = selectedItem?.name || placeholder;

  const handleCreateSubmit = async () => {
    if (!createValue.trim()) return;

    try {
      const newItem = await onCreateItem(createValue.trim());
      onSelectionChange(newItem.id);
      setCreateValue("");
      setIsCreatingMode(false);
      state.close(); // Close the popover after successful creation
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error("Failed to create item:", error);
    }
  };

  const handleCreateCancel = () => {
    setCreateValue("");
    setIsCreatingMode(false);
    // Don't close the popover, just exit create mode
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && createValue.trim()) {
      e.preventDefault();
      handleCreateSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCreateCancel();
    }
  };

  const handleItemSelection = (key: string | number) => {
    if (key === "CREATE_NEW") {
      setIsCreatingMode(true);
      // Don't close the popover when entering create mode
      return;
    } else {
      onSelectionChange(key);
      setIsCreatingMode(false);
      state.close(); // Close the popover after selection
    }
  };

  return (
    <div>
      <Label className="text-foreground block text-sm font-medium">
        {label} {isRequired && "*"}
      </Label>

      <OverlayTriggerStateContext.Provider value={state}>
        <AriaButton
          ref={triggerRef}
          className="border-input bg-background focus:border-ring focus:ring-ring text-foreground relative mt-1 w-full cursor-default rounded-md border py-2 pr-10 pl-3 text-left shadow-sm focus:ring-1 focus:outline-none sm:text-sm"
          onPress={() => state.toggle()}
        >
          <span className="block truncate">{displayText}</span>
          <ChevronDownIcon
            className="text-muted-foreground pointer-events-none absolute inset-y-0 top-1/2 right-0 mr-2 h-5 w-5 -translate-y-1/2 transform"
            aria-hidden="true"
          />
        </AriaButton>

        {state.isOpen && (
          <Popover
            triggerRef={triggerRef}
            placement="bottom start"
            className={clsx(
              "max-h-60 overflow-auto rounded-md py-1",
              "bg-popover ring-black",
              "ring-opacity-5 border-border border ring-1",
              "text-base sm:text-sm",
              "shadow-lg focus:outline-none",
            )}
            style={{
              width: triggerRef.current?.offsetWidth
                ? `${triggerRef.current.offsetWidth}px`
                : "auto",
            }}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setIsCreatingMode(false);
                setCreateValue("");
                state.close();
              }
            }}
          >
            {isCreatingMode ? (
              <div className="space-y-2 p-2">
                <TextField value={createValue} onChange={setCreateValue}>
                  <FMInput
                    placeholder="Enter name..."
                    autoFocus
                    onKeyDown={handleKeyDown}
                  />
                </TextField>
                <div className="flex justify-end gap-2">
                  <AriaButton
                    className="text-muted-foreground dark:text-muted-foreground flex h-6 w-6 items-center justify-center hover:text-gray-600 dark:hover:text-gray-200"
                    onPress={handleCreateCancel}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </AriaButton>
                  <AriaButton
                    className="text-muted-foreground dark:text-muted-foreground flex h-6 w-6 items-center justify-center hover:text-gray-600 disabled:opacity-50 dark:hover:text-gray-200"
                    onPress={handleCreateSubmit}
                    isDisabled={!createValue.trim() || isCreating}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </AriaButton>
                </div>
              </div>
            ) : (
              <ListBox onAction={handleItemSelection} selectionMode="single">
                <ListBoxItem
                  id="CREATE_NEW"
                  className="text-popover-foreground hover:bg-accent hover:text-accent-foreground border-border relative cursor-pointer border-b py-2 pr-9 pl-3 font-medium select-none"
                >
                  + {createLabel}
                </ListBoxItem>
                {isLoading ? (
                  <ListBoxItem
                    id="loading"
                    className="dark:text-muted-foreground relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none"
                  >
                    Loading...
                  </ListBoxItem>
                ) : items.length > 0 ? (
                  items.map((item) => (
                    <ListBoxItem
                      key={item.id}
                      id={item.id}
                      className={clsx(
                        "text-popover-foreground relative cursor-default py-2 pr-9 pl-3 select-none",
                        "hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {item.name}
                    </ListBoxItem>
                  ))
                ) : (
                  <ListBoxItem
                    id="no-items"
                    className="dark:text-muted-foreground relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none"
                  >
                    No items available
                  </ListBoxItem>
                )}
              </ListBox>
            )}
          </Popover>
        )}
      </OverlayTriggerStateContext.Provider>

      {children}
    </div>
  );
}
