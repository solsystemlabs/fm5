import type { ReactNode } from "react";
import {
  Autocomplete,
  Button,
  FieldError,
  Header,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover,
  SearchField,
  Select,
  SelectValue,
  Text,
  useFilter,
} from "react-aria-components";
import FMInput from "../ui/FMInput";
import { SearchIcon, XIcon } from "lucide-react";
import { useFilamentsGrouped } from "@/lib/api-hooks";
import { ColorLabel } from "../color/ColorLabel";

interface FilamentSelectProps {
  label: string;
}

export default function FilamentSelect({
  label,
}: FilamentSelectProps): ReactNode {
  let { contains } = useFilter({ sensitivity: "base" });
  const { data: groupedFilaments, isLoading, error } = useFilamentsGrouped();

  return (
    <Select>
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <Button className="flex">
          <SelectValue />
        </Button>
      </div>
      <Text slot="description">Select one or more filaments</Text>
      <FieldError />
      <Popover className="bg-primary rounded-md">
        <Autocomplete filter={contains}>
          <SearchField
            aria-label="Search"
            autoFocus
            className="group m-1 flex items-center rounded-md border-2"
          >
            <SearchIcon aria-hidden className="ml-2 h-4 w-4" />
            <FMInput className="min-w-0 flex-1 border-none px-2 py-1 text-base outline" />
            <Button className="mr-1 flex w-6 items-center justify-center rounded-md border-0 bg-transparent p-1 text-center text-sm transition group-empty:invisible">
              <XIcon aria-hidden className="h-4 w-4" />
            </Button>
          </SearchField>
          <ListBox selectionMode="multiple">
            {isLoading && (
              <ListBoxItem>
                <Text slot="label">Loading filaments...</Text>
              </ListBoxItem>
            )}
            {error && (
              <ListBoxItem>
                <Text slot="label">Error loading filaments</Text>
              </ListBoxItem>
            )}
            {groupedFilaments && Object.keys(groupedFilaments).length === 0 && (
              <ListBoxItem>
                <Text slot="label">No filaments available</Text>
              </ListBoxItem>
            )}
            {groupedFilaments && Object.entries(groupedFilaments).map(([filamentTypeName, filaments]) => (
              <ListBoxSection key={filamentTypeName}>
                <Header>{filamentTypeName}</Header>
                {filaments.map((filament) => (
                  <ListBoxItem key={filament.id} id={filament.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="size-4 rounded border border-gray-300 shrink-0"
                        style={{ backgroundColor: filament.color }}
                        aria-label={`${filament.name} color indicator`}
                      />
                      <div className="flex flex-col">
                        <Text slot="label">{filament.name}</Text>
                        <Text slot="description">{filament.Brand.name}</Text>
                      </div>
                    </div>
                  </ListBoxItem>
                ))}
              </ListBoxSection>
            ))}
          </ListBox>
        </Autocomplete>
      </Popover>
    </Select>
  );
}
