import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../utils/cn";

export interface SelectOption<T extends string | number> {
  label: string;
  value: T;
  description?: string;
}

interface SelectMenuProps<T extends string | number> {
  label: string;
  options: Array<SelectOption<T>>;
  value: T | null;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: T | null) => void;
  emptyMessage?: string;
  includePlaceholderOption?: boolean;
}

export function SelectMenu<T extends string | number>({
  label,
  options,
  value,
  placeholder = "Select an option",
  disabled = false,
  onChange,
  emptyMessage = "No options available",
  includePlaceholderOption = true,
}: SelectMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const id = useId();

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  const listItems = useMemo(() => {
    if (!includePlaceholderOption) {
      return options;
    }
    return [null, ...options] as Array<SelectOption<T> | null>;
  }, [includePlaceholderOption, options]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    buttonRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        setIsOpen(true);
        requestAnimationFrame(() => {
          const listElement = listRef.current;
          if (!listElement) return;
          const active =
            listElement.querySelector<HTMLLIElement>('[data-active="true"]') ??
            listElement.querySelector<HTMLLIElement>('[data-index="0"]');
          active?.focus();
        });
      }
    },
    [disabled]
  );

  const handleOptionKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLLIElement>) => {
      const listElement = listRef.current;
      if (!listElement) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      const current = event.currentTarget;
      const index = Number(current.dataset.index ?? "-1");

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const next =
          listElement.querySelector<HTMLLIElement>(
            `[data-index="${index + 1}"]`
          ) ?? listElement.querySelector<HTMLLIElement>(`[data-index="0"]`);
        next?.focus();
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const prev =
          listElement.querySelector<HTMLLIElement>(
            `[data-index="${index - 1}"]`
          ) ??
          listElement.querySelector<HTMLLIElement>(
            `[data-index="${listItems.length - 1}"]`
          );
        prev?.focus();
      }

      if (event.key === "Home") {
        event.preventDefault();
        listElement.querySelector<HTMLLIElement>(`[data-index="0"]`)?.focus();
      }

      if (event.key === "End") {
        event.preventDefault();
        listElement
          .querySelector<HTMLLIElement>(
            `[data-index="${listItems.length - 1}"]`
          )
          ?.focus();
      }
    },
    [closeMenu, listItems.length]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: MouseEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [isOpen]);

  useEffect(() => {
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleWindowKeyDown);
    }
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [isOpen]);

  return (
    <div className="space-y-2" ref={containerRef}>
      <label
        htmlFor={`select-menu-${id}`}
        className="block text-sm font-medium text-text-muted"
      >
        {label}
      </label>
      <div className="relative">
        <button
          id={`select-menu-${id}`}
          type="button"
          ref={buttonRef}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-lg border border-divider/60 bg-surface-raised/60 px-3 py-2 text-left text-sm text-text shadow-sm transition focus:border-primary focus:outline-none focus-visible:ring-3 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60",
            isOpen && "border-primary ring-3 ring-primary/40"
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => {
            if (!disabled) setIsOpen((prev) => !prev);
          }}
          onKeyDown={handleKeyDown}
        >
          <span className="flex-1 truncate">
            {selectedOption?.label ?? (
              <span className="text-text-muted">{placeholder}</span>
            )}
          </span>
          <span
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded-full border border-divider/60 text-xs text-text-muted transition",
              isOpen && "rotate-180"
            )}
            aria-hidden
          >
            v
          </span>
        </button>
        {isOpen && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-divider/60 bg-surface-raised shadow-surface">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-text-muted">
                {emptyMessage}
              </div>
            ) : (
              <ul
                ref={listRef}
                role="listbox"
                className="max-h-64 overflow-auto py-1"
              >
                {listItems.map((option, index) => {
                  const isPlaceholder = option === null;
                  const optionId = isPlaceholder
                    ? `option-${id}-placeholder`
                    : `option-${id}-${option.value}`;
                  const isSelected = isPlaceholder
                    ? value === null
                    : option.value === value;
                  return (
                    <li
                      key={optionId}
                      id={optionId}
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={0}
                      data-index={index}
                      data-active={isSelected}
                      onKeyDown={handleOptionKeyDown}
                      onClick={() => {
                        onChange(isPlaceholder ? null : option.value);
                        setIsOpen(false);
                        buttonRef.current?.focus();
                      }}
                      className={cn(
                        "flex cursor-pointer flex-col gap-1 px-4 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                        isSelected
                          ? "bg-primary/15 text-primary"
                          : "hover:bg-surface-raised/60 text-text"
                      )}
                    >
                      <span className="truncate font-medium">
                        {isPlaceholder ? placeholder : option.label}
                      </span>
                      {option?.description && (
                        <span className="truncate text-xs text-text-muted">
                          {option.description}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
