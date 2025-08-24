import type { ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { XMarkIcon } from "@heroicons/react/24/outline";

type FMModalProps = {
  triggerElement: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  primaryAction?: {
    label: string;
    onPress?: () => void;
    className?: string;
  };
  secondaryAction?: {
    label: string;
    onPress?: () => void;
    className?: string;
  };
  showCloseButton?: boolean;
};

export default function FMModal({
  triggerElement,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  showCloseButton = true,
}: FMModalProps): ReactNode {
  return (
    <DialogTrigger>
      {triggerElement}
      <ModalOverlay
        isDismissable
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-900/50 flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
      >
        <Modal className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95 dark:bg-gray-800 dark:outline dark:-outline-offset-1 dark:outline-white/10">
          <Dialog className="outline-hidden">
            {({ close }) => (
              <>
                {showCloseButton && (
                  <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                    <Button
                      onPress={close}
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 dark:bg-gray-800 dark:hover:text-gray-300 dark:focus:outline-white"
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon aria-hidden="true" className="size-6" />
                    </Button>
                  </div>
                )}
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Heading
                      slot="title"
                      className="text-base font-semibold text-gray-900 dark:text-white"
                    >
                      {title}
                    </Heading>
                    {description && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {description}
                        </p>
                      </div>
                    )}
                    <div className="mt-4">{children}</div>
                  </div>
                </div>
                {(primaryAction || secondaryAction) && (
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    {primaryAction && (
                      <Button
                        onPress={() => {
                          primaryAction.onPress?.();
                          if (!primaryAction.onPress) close();
                        }}
                        className={
                          primaryAction.className ||
                          "inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 sm:ml-3 sm:w-auto dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400"
                        }
                      >
                        {primaryAction.label}
                      </Button>
                    )}
                    {secondaryAction && (
                      <Button
                        onPress={() => {
                          secondaryAction.onPress?.();
                          if (!secondaryAction.onPress) close();
                        }}
                        className={
                          secondaryAction.className ||
                          "mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
                        }
                      >
                        {secondaryAction.label}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}