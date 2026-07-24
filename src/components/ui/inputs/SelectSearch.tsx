"use client";

import "@/styles/04-components/ui/inputs/input.scss";
import "@/styles/04-components/ui/inputs/select.scss";
import "@/styles/04-components/ui/inputs/select-search.scss";

import {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "next-intl";

import {
  SelectSearchOption,
  SelectSearchProps,
} from "@/types/ui/inputs/select-search";

import Input from "./Input";

import { CheckIcon, ChevronDownIcon } from "lucide-react";

const OPEN_KEYS = ["ArrowDown", "ArrowUp", "Enter", " "];

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Envuelve en `<mark>` los fragmentos de `label` que coinciden con `query`. */
const highlightMatch = (label: string, query: string) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return label;

  const parts = label.split(
    new RegExp(`(${escapeRegExp(trimmedQuery)})`, "gi"),
  );

  return parts.map((part, index) =>
    part.toLowerCase() === trimmedQuery.toLowerCase() ? (
      <mark key={index} className="select-search__match">
        {part}
      </mark>
    ) : (
      part
    ),
  );
};

/** Posición calculada del desplegable respecto al viewport (portal a document.body). */
interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  placement: "bottom" | "top";
}

/**
 * Select con buscador integrado: filtra las opciones a medida que se escribe
 * y resalta las coincidencias; soporta selección múltiple y se renderiza en un portal.
 * @param {SelectSearchProps} props - Propiedades del componente
 * @returns {JSX.Element} El selector con buscador renderizado
 */
export default function SelectSearch(props: SelectSearchProps) {
  const {
    id,
    name,
    label,
    description,
    placeholder,
    ariaLabel,
    options,
    required,
    disabled,
    error,
    touched,
    searchPlaceholder,
    noResultsText,
    className,
    defaultOpen = false,
    defaultSearchTerm = "",
    multiple,
    noTranslate,
  } = props;
  const t = useTranslations("Common");
  const labels = useTranslations("Labels");
  const placeholders = useTranslations("Placeholders");
  const tValidations = useTranslations("Validations");
  const reactId = useId();
  const selectId = id ?? reactId;
  const listboxId = `${selectId}-listbox`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  // `Input` no reenvía refs a su `<input>` nativo, así que para poder
  // enfocar el buscador al abrir el desplegable se referencia el section
  // que lo envuelve y se localiza el `<input>` dentro con `querySelector`.
  const searchSectionRef = useRef<HTMLElement>(null);

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchTerm, setSearchTerm] = useState(defaultSearchTerm);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const selectedValues: string[] = multiple
    ? props.value
    : props.value
      ? [props.value]
      : [];
  const selectedIndex = options.findIndex((opt) =>
    selectedValues.includes(opt.value),
  );
  const selectedOptions = options.filter((opt) =>
    selectedValues.includes(opt.value),
  );
  const displayLabel = selectedOptions.map((opt) => opt.label).join(", ");
  const resolvedPlaceholder = placeholder
    ? noTranslate
      ? placeholder
      : placeholders(placeholder)
    : undefined;
  const resolvedAriaLabel = ariaLabel
    ? noTranslate
      ? ariaLabel
      : labels(ariaLabel)
    : undefined;
  // `searchPlaceholder` es siempre texto literal (ver JSDoc de
  // `SelectSearchBaseProps`), independiente de `noTranslate`; sin indicarlo
  // se resuelve la clave `Placeholders.search` por defecto.
  const resolvedSearchPlaceholder = searchPlaceholder ?? placeholders("search");

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredOptions = normalizedSearch
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(normalizedSearch),
      )
    : options;

  const clampedHighlightedIndex = Math.min(
    highlightedIndex,
    Math.max(filteredOptions.length - 1, 0),
  );

  const computePosition = () => {
    const trigger = triggerRef.current;
    // v8 ignore next -- defensivo: solo se invoca tras montar el botón (click/teclado/scroll/resize con el desplegable ya abierto), el ref siempre está asignado.
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placement: DropdownPosition["placement"] =
      spaceBelow < 280 && spaceAbove > spaceBelow ? "top" : "bottom";

    setPosition({
      top: placement === "bottom" ? rect.bottom + 4 : rect.top - 4,
      left: rect.left,
      width: rect.width,
      placement,
    });
  };

  const closeDropdown = (focusTrigger = true) => {
    setIsOpen(false);
    setSearchTerm("");
    if (focusTrigger) triggerRef.current?.focus();
  };

  const openDropdown = () => {
    if (disabled || options.length === 0) return;
    computePosition();
    setSearchTerm("");
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  const selectOption = (option?: SelectSearchOption) => {
    if (!option) return;

    if (multiple) {
      const next = props.value.includes(option.value)
        ? props.value.filter((v) => v !== option.value)
        : [...props.value, option.value];
      props.onChange(next);
      return;
    }

    if (option.value !== props.value) props.onChange(option.value);
    closeDropdown();
  };

  // Calcula la posición si el desplegable nace abierto (demos/documentación)
  useEffect(() => {
    if (defaultOpen) computePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enfoca el buscador al abrir el desplegable
  useEffect(() => {
    if (!isOpen) return;
    searchSectionRef.current?.querySelector("input")?.focus();
  }, [isOpen]);

  // Reposiciona en scroll/resize y cierra al hacer click fuera del trigger o del dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleReposition = () => computePosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      closeDropdown(false);
    };

    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  // Mantiene la opción resaltada visible al navegar con teclado
  useEffect(() => {
    if (!isOpen) return;
    const optionEl = listboxRef.current?.children[clampedHighlightedIndex] as
      | HTMLElement
      | undefined;
    optionEl?.scrollIntoView({ block: "nearest" });
  }, [isOpen, clampedHighlightedIndex]);

  const handleTriggerKeyDown = (event: ReactKeyboardEvent) => {
    if (disabled || isOpen) return;
    if (OPEN_KEYS.includes(event.key)) {
      event.preventDefault();
      openDropdown();
    }
  };

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, filteredOptions.length - 1),
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setHighlightedIndex(0);
        break;
      case "End":
        event.preventDefault();
        setHighlightedIndex(filteredOptions.length - 1);
        break;
      case "Enter":
        event.preventDefault();
        selectOption(filteredOptions[clampedHighlightedIndex]);
        break;
      case "Escape":
        event.preventDefault();
        closeDropdown();
        break;
      case "Tab":
        closeDropdown(false);
        break;
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setHighlightedIndex(0);
  };

  const dropdown = isOpen && position && (
    <div
      ref={dropdownRef}
      className="select-search__dropdown"
      data-outside-click-ignore=""
      style={{
        position: "fixed",
        left: position.left,
        width: position.width,
        ...(position.placement === "bottom"
          ? { top: position.top }
          : { bottom: window.innerHeight - position.top }),
      }}
    >
      <section className="select-search__search" ref={searchSectionRef}>
        <Input
          id={`${id}-select-search`}
          name={`${name}-select-search`}
          type="search"
          placeholder={resolvedSearchPlaceholder}
          noTranslate
          ariaLabel={resolvedSearchPlaceholder}
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          autoComplete="off"
          aria-controls={listboxId}
          aria-activedescendant={
            filteredOptions.length > 0
              ? `${selectId}-option-${clampedHighlightedIndex}`
              : undefined
          }
          className="input__full"
        />
      </section>

      {filteredOptions.length > 0 ? (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-multiselectable={multiple || undefined}
          onMouseDown={(event) => event.preventDefault()}
          className="select-search__listbox"
        >
          {filteredOptions.map((opt, index) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <li
                key={opt.value}
                id={`${selectId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                className={`select__option${
                  index === clampedHighlightedIndex
                    ? " select__option--highlighted"
                    : ""
                }${isSelected ? " select__option--selected" : ""}`}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectOption(opt)}
              >
                <span className="select__option__label">
                  {highlightMatch(opt.label, searchTerm)}
                </span>
                {multiple && isSelected && (
                  <CheckIcon
                    className="select__option__check"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="select-search__empty">
          {noResultsText ? noResultsText : t("noResults")}
        </p>
      )}
    </div>
  );

  return (
    <div className={`select__group ${className ? ` ${className}` : ""}`}>
      {label && (
        <label
          id={`${selectId}-label`}
          className={`select__label ${error && touched ? " label__error" : ""}`}
        >
          {noTranslate ? label : labels(label)}
          {required && <span className="select__required">*</span>}
        </label>
      )}

      {description && <p className="select__description">{description}</p>}

      {name &&
        (multiple ? (
          props.value.map((v) => (
            <input key={v} type="hidden" name={name} value={v} />
          ))
        ) : (
          <input type="hidden" name={name} value={props.value} />
        ))}

      <div className="select__wrapper">
        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-label={!label ? resolvedAriaLabel : undefined}
          aria-required={required}
          aria-invalid={Boolean(error && touched)}
          disabled={disabled}
          className={`select ${error && touched ? " select__error" : ""}`}
          onClick={() => (isOpen ? closeDropdown() : openDropdown())}
          onKeyDown={handleTriggerKeyDown}
        >
          <span
            className={`select__value${
              !displayLabel ? " select__value--placeholder" : ""
            }`}
          >
            {displayLabel || resolvedPlaceholder || ""}
          </span>
        </button>
        <ChevronDownIcon className="select__icon" aria-hidden="true" />
      </div>

      {typeof document !== "undefined" &&
        dropdown &&
        createPortal(dropdown, document.body)}

      {error && touched && (
        <p className="label__error">* {tValidations(error)}</p>
      )}
    </div>
  );
}
