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
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // Use React Aria's overlay trigger state
  const state = useOverlayTriggerState({});

  // Find the selected item to display its name
  const selectedItem = items.find(item => item.id === selectedKey);
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
    if (e.key === 'Enter' && createValue.trim()) {
      e.preventDefault();
      handleCreateSubmit();
    } else if (e.key === 'Escape') {
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
      <Label className="block text-sm font-medium text-foreground">
        {label} {isRequired && "*"}
      </Label>
      
      <OverlayTriggerStateContext.Provider value={state}>
        <AriaButton 
          ref={triggerRef}
          className="relative mt-1 w-full cursor-default rounded-md border border-input bg-background py-2 pr-10 pl-3 text-left shadow-sm focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none sm:text-sm text-foreground"
          onPress={() => state.toggle()}
        >
          <span className="block truncate">
            {displayText}
          </span>
          <ChevronDownIcon
            className="pointer-events-none absolute inset-y-0 top-1/2 right-0 mr-2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground"
            aria-hidden="true"
          />
        </AriaButton>
        
        {state.isOpen && (
          <Popover 
            triggerRef={triggerRef}
            placement="bottom start"
            className="ring-opacity-5 max-h-60 overflow-auto rounded-md bg-popover py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm border border-border"
            style={{
              width: triggerRef.current?.offsetWidth ? `${triggerRef.current.offsetWidth}px` : 'auto'
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
              <div className="p-2 space-y-2">
                <TextField value={createValue} onChange={setCreateValue}>
                  <FMInput 
                    placeholder="Enter name..." 
                    autoFocus 
                    onKeyDown={handleKeyDown}
                  />
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
              <ListBox 
                onAction={handleItemSelection}
                selectionMode="single"
              >
                <ListBoxItem
                  id="CREATE_NEW"
                  className="relative cursor-pointer py-2 pr-9 pl-3 text-popover-foreground select-none hover:bg-accent hover:text-accent-foreground border-b border-border font-medium"
                >
                  + {createLabel}
                </ListBoxItem>
                {isLoading ? (
                  <ListBoxItem
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
                    id="no-items"
                    className="relative cursor-default py-2 pr-9 pl-3 text-gray-500 select-none dark:text-muted-foreground"
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