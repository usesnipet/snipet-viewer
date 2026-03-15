import React, { createContext, useCallback, useState } from 'react';

import { Dialog } from '@/components/ui/dialog';

export type DialogComponents = Record<string, React.ComponentType<any>>;

export type DialogKey<D extends DialogComponents> = Extract<keyof D, string>;

export type DialogProps<
  D extends DialogComponents,
  T extends DialogKey<D>,
> = React.ComponentProps<D[T]>;

export type OpenDialogOptions<
  D extends DialogComponents,
  T extends DialogKey<D> = DialogKey<D>,
> = {
  type: T;
  props?: DialogProps<D, T>;
  onClose?: () => void;
};

export type DialogState<D extends DialogComponents = DialogComponents> = {
  openDialog: (opts: OpenDialogOptions<D>) => void;
  closeDialog: (type?: DialogKey<D>) => void;
  closeAllDialogs: () => void;
};

export const DialogContext = createContext<DialogState | undefined>(undefined);

type DialogProviderProps<D extends DialogComponents> = {
  children: React.ReactNode;
  dialogs: D;
};

type DialogContainerProps<D extends DialogComponents> = {
  dialogs: D;
  dialogStack: OpenDialogOptions<D>[];
  closeDialog: (type?: DialogKey<D>) => void;
};

export const DialogContainer = <D extends DialogComponents>({
  dialogs,
  dialogStack,
  closeDialog,
}: DialogContainerProps<D>) => {
  return (
    <>
      {dialogStack.map(({ type, props }, index) => {
        const DialogComponent = dialogs[type];
        if (!DialogComponent) {
          console.error(`Dialog ${type} not found`);
          return null;
        }
        return (
          <Dialog
            key={index}
            open
            onOpenChange={() => closeDialog(type)}
          >
            <DialogComponent {...props} />
          </Dialog>
        );
      })}
    </>
  );
};

export const DialogProvider = <D extends DialogComponents>({
  children,
  dialogs,
}: DialogProviderProps<D>) => {
  const [dialogStack, setDialogStack] = useState<OpenDialogOptions<D>[]>([]);

  const openDialog = (opts: OpenDialogOptions<D>) => {
    setDialogStack((prev) => [...prev, opts]);
  };

  const closeDialog = useCallback(
    (type?: DialogKey<D>) => {
    setDialogStack((prev) => {
      if (type) {
        const targetIndex = prev.findIndex((dialog) => dialog.type === type);
        const target = targetIndex >= 0 ? prev[targetIndex] : prev[prev.length - 1];
        if (target) target.onClose?.();
        return prev.filter((dialog) => dialog.type !== type);
      }
      const target = prev[prev.length - 1];
      if (target) target.onClose?.();
      return prev.slice(0, -1);
    });
  }, []);

  const closeAllDialogs = () => setDialogStack([]);

  return (
    <DialogContext.Provider value={{ closeAllDialogs, closeDialog, openDialog }}>
      {children}
      <DialogContainer dialogs={dialogs} dialogStack={dialogStack} closeDialog={closeDialog} />
    </DialogContext.Provider>
  );
};