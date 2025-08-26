import type { ReactNode } from "react";
import { useState } from "react";
import {
  Button,
  FieldError,
  Header,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover,
  SearchField,
  Text,
  useFilter,
  type Selection,
  DialogTrigger,
  Dialog,
} from "react-aria-components";
import FMInput from "../ui/FMInput";
import { SearchIcon, XIcon, ChevronDownIcon } from "lucide-react";
import { useFilamentsGrouped } from "@/lib/api-hooks";
import { ColorLabel } from "../color/ColorLabel";

interface FilamentSelectProps {
  label: string;
  selectedFilamentIds?: number[];
  onSelectionChange?: (filamentIds: number[]) => void;
}

export default function FilamentSelect({
  label,
  selectedFilamentIds = [],
  onSelectionChange,
}: FilamentSelectProps): ReactNode {
  let { contains } = useFilter({ sensitivity: "base" });
  const { data: groupedFilaments, isLoading, error } = useFilamentsGrouped();
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(selectedFilamentIds.map(String)));
  const [searchValue, setSearchValue] = useState("");

  // Get all filaments in a flat array for easy lookup
  const allFilaments = groupedFilaments ? Object.values(groupedFilaments).flat() : [];
  
  // Filter filaments based on search
  const filteredGroupedFilaments = groupedFilaments ? Object.entries(groupedFilaments).reduce((acc, [typeName, filaments]) => {
    const filtered = filaments.filter(filament => 
      searchValue === "" || contains(filament.name, searchValue)
    );
    if (filtered.length > 0) {
      acc[typeName] = filtered;
    }
    return acc;
  }, {} as typeof groupedFilaments) : null;
  
  // Get selected filaments for display
  const selectedFilaments = allFilaments.filter(filament => 
    selectedKeys instanceof Set && selectedKeys.has(filament.id.toString())
  );

  const handleSelectionChange = (selection: Selection) => {
    setSelectedKeys(selection);
    if (onSelectionChange && selection instanceof Set) {
      const ids = Array.from(selection).map(id => parseInt(id as string));
      onSelectionChange(ids);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-foreground block text-sm font-medium">{label}</Label>
      <DialogTrigger>
        <Button className="border-input bg-background focus:border-ring focus:ring-ring text-foreground relative w-full cursor-default rounded-md border py-2 pr-10 pl-3 text-left shadow-sm focus:ring-1 focus:outline-none sm:text-sm">
          {selectedFilaments.length === 0 ? (
            <span className="text-muted-foreground">Select filaments...</span>
          ) : selectedFilaments.length === 1 ? (
            <div className="flex items-center gap-2">
              <div
                className="size-4 rounded border border-border shrink-0"
                style={{ backgroundColor: selectedFilaments[0].color }}
              />
              <span className="truncate">{selectedFilaments[0].name} - {selectedFilaments[0].Brand.name}</span>
            </div>
          ) : (
            <span className="truncate">{selectedFilaments.length} filaments selected</span>
          )}
          <ChevronDownIcon
            className="text-muted-foreground pointer-events-none absolute inset-y-0 top-1/2 right-0 mr-2 h-5 w-5 -translate-y-1/2 transform"
            aria-hidden="true"
          />
        </Button>
        <Popover className="ring-opacity-5 bg-popover border-border mt-1 max-h-60 w-[var(--trigger-width)] overflow-auto rounded-md border py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm">
          <SearchField
            aria-label="Search filaments"
            className="group mx-2 mt-2 flex items-center rounded-md border border-input"
            value={searchValue}
            onChange={setSearchValue}
          >
            <SearchIcon aria-hidden className="ml-2 h-4 w-4 text-muted-foreground" />
            <FMInput className="min-w-0 flex-1 border-none px-2 py-1 text-sm" />
            <Button 
              className="mr-1 flex w-6 items-center justify-center rounded-md border-0 bg-transparent p-1 text-center text-sm transition group-empty:invisible text-muted-foreground hover:text-foreground"
              onPress={() => setSearchValue("")}
            >
              <XIcon aria-hidden className="h-4 w-4" />
            </Button>
          </SearchField>
          <ListBox 
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            onSelectionChange={handleSelectionChange}
            className="outline-none"
          >
            {isLoading && (
              <ListBoxItem className="text-muted-foreground relative cursor-default py-2 pr-9 pl-3 select-none">
                Loading filaments...
              </ListBoxItem>
            )}
            {error && (
              <ListBoxItem className="text-destructive relative cursor-default py-2 pr-9 pl-3 select-none">
                Error loading filaments
              </ListBoxItem>
            )}
            {filteredGroupedFilaments && Object.keys(filteredGroupedFilaments).length === 0 && (
              <ListBoxItem className="text-muted-foreground relative cursor-default py-2 pr-9 pl-3 select-none">
                {searchValue ? `No filaments found matching "${searchValue}"` : "No filaments available"}
              </ListBoxItem>
            )}
            {filteredGroupedFilaments && Object.entries(filteredGroupedFilaments).map(([filamentTypeName, filaments]) => (
              <ListBoxSection key={filamentTypeName}>
                <Header className="text-muted-foreground px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b border-border">
                  {filamentTypeName}
                </Header>
                {filaments.map((filament) => (
                  <ListBoxItem 
                    key={filament.id} 
                    id={filament.id.toString()}
                    textValue={filament.name}
                    className="text-popover-foreground hover:bg-accent hover:text-accent-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[focus-visible]:bg-accent data-[focus-visible]:text-accent-foreground relative cursor-default py-2 pr-9 pl-3 select-none"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="size-4 rounded border border-border shrink-0"
                        style={{ backgroundColor: filament.color }}
                        aria-label={`${filament.name} color indicator`}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{filament.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{filament.Brand.name}</span>
                      </div>
                    </div>
                  </ListBoxItem>
                ))}
              </ListBoxSection>
            ))}
          </ListBox>
        </Popover>
      </DialogTrigger>
      <Text className="text-muted-foreground text-xs">Select one or more filaments</Text>
      <FieldError className="text-destructive text-sm" />
    </div>
  );
}
