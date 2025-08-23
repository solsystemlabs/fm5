import type { Filament } from "../lib/types";
import type { ReactNode } from "react";
import {
  Cell,
  ColorSwatch,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "react-aria-components";
import FMCell from "./table/FMCell";
import clsx from "clsx";
import FMColumn from "./table/FMColumn";

export default function FilamentsTable({
  data,
}: {
  data: Filament[];
}): ReactNode {
  return (
    <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg dark:ring-white/15">
      <Table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
        <TableHeader className="bg-gray-200">
          <Row className="divide-y divide-gray-300 dark:divide-white/15">
            <Column className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-white">
              Filament
            </Column>
            <Column className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell dark:text-white">
              Brand
            </Column>
            <Column className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell dark:text-white">
              Material
            </Column>
            <Column className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell dark:text-white">
              Diameter
            </Column>
            <FMColumn>Cost</FMColumn>
            <FMColumn>Weight</FMColumn>
            <FMColumn className="">Models</FMColumn>
          </Row>
        </TableHeader>
        <TableBody>
          {data.map((filament) => (
            <Row
              key={filament.id}
              className="not-last:border-b border-gray-300"
            >
              <Cell className="relative py-4 pr-3 pl-4 text-sm sm:pl-6">
                <div className="flex items-center gap-x-3">
                  <ColorSwatch
                    className="h-8 w-8 rounded-sm flex-shrink-0 shadow-[0_4px_6px_0_rgba(50,50,50,0.25)]"
                    color={filament.color}
                  />
                  <div className="">
                    <div className="justify-end font-bold text-md text-gray-900 dark:text-white">
                      {filament.name}
                    </div>
                    <div className="font-medium text-gray-500 dark:text-white">
                      {filament.color}
                    </div>
                  </div>
                </div>
                <div className="mt-1 flex flex-col text-gray-500 sm:block lg:hidden dark:text-gray-400">
                  <span>{filament.brandName}</span>
                  <span className="hidden sm:inline text-gray-300"> | </span>
                  <span>{filament.Material.name}</span>
                  <span className="hidden sm:inline text-gray-300"> | </span>
                  <span>{filament.diameter}mm</span>
                </div>
              </Cell>
              <FMCell className="hidden lg:table-cell">
                {filament.brandName}
              </FMCell>
              <FMCell className="hidden lg:table-cell">
                {filament.Material.name}
              </FMCell>
              <FMCell className="hidden lg:table-cell">
                {filament.diameter}mm
              </FMCell>
              <FMCell className="px-3 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                <div className="sm:hidden">${filament.cost}</div>
                <div className="hidden sm:block">${filament.cost}</div>
              </FMCell>
              <FMCell className="px-3 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                {filament.grams}g
              </FMCell>
              <FMCell className="relative py-3.5 pr-4 pl-3  text-sm font-medium sm:pr-6">
                <div className="text-gray-500 dark:text-gray-400">
                  {filament.Models && filament.Models.length > 0 ? (
                    <span>
                      {filament.Models.length} model
                      {filament.Models.length !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span>No models</span>
                  )}
                </div>
              </FMCell>
            </Row>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
