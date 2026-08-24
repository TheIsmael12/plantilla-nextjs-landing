"use client";

import "@/styles/04-components/ui/inputs/input.scss";
import "@/styles/04-components/ui/inputs/select.scss";

import {
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "next-intl";

import { SelectProps } from "@/types/ui/inputs/select";

import { CheckIcon, ChevronDownIcon } from "lucide-react";

const OPEN_KEYS = ["ArrowDown", "ArrowUp", "Enter", " "];
const TYPEAHEAD_RESET_MS = 500;

/** Posición calculada del desplegable respecto al viewport (portal a document.body). */
interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  placement: "bottom" | "top";
}

/**
 * Select accesible (combobox) con soporte de selección múltiple, búsqueda por
 * teclado (typeahead) y listado renderizado en un portal a `document.body`.
 * @param {SelectProps} props - Propiedades del componente
 * @returns {JSX.Element} El selector renderizado
 */
export default function Select(props: SelectProps) {
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
    size = "md",
    className,
    multiple,
    noTranslate,
  } = props;
  const reactId = useId();
  const selectId = id ?? reactId;
  const listboxId = `${selectId}-listbox`;

  const labels = useTranslations("Labels");
  const placeholders = useTranslations("Placeholders");
  const tValidations = useTranslations("Validations");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const typeaheadRef = useRef({ buffer: "", timeout: 0 });

  /*
   * Sin ninguna opción el selector se pinta **deshabilitado**.
   *
   * `openDropdown` ya salía sin hacer nada en ese caso, y eso es lo peor de los dos mundos: un control con
   * su flecha, con su aspecto de pulsable, que al pulsarlo no hace nada. Es exactamente lo que pasaba en el
   * formulario de candidatura espontánea cuando la lista de ciudades llegaba vacía, y desde fuera se lee
   * como que el desplegable está roto. Deshabilitado se ve que no hay nada que elegir.
   */
  const hasNoOptions = options.length === 0;
  const isInert = disabled || hasNoOptions;

  const [isOpen, setIsOpen] = useState(false);
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

  const computePosition = () => {
    const trigger = triggerRef.current;
    // v8 ignore next -- defensivo: solo se invoca tras montar el botón (click/teclado/scroll/resize con el listado ya abierto), el ref siempre está asignado.
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placement: DropdownPosition["placement"] =
      spaceBelow < 240 && spaceAbove > spaceBelow ? "top" : "bottom";

    setPosition({
      top: placement === "bottom" ? rect.bottom + 4 : rect.top - 4,
      left: rect.left,
      width: rect.width,
      placement,
    });
  };

  const closeDropdown = (focusTrigger = true) => {
    setIsOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const openDropdown = (initialIndex?: number) => {
    if (disabled || options.length === 0) return;
    computePosition();
    setHighlightedIndex(
      initialIndex ?? (selectedIndex >= 0 ? selectedIndex : 0),
    );
    setIsOpen(true);
  };

  const selectOption = (index: number) => {
    const option = options[index];
    // v8 ignore next -- defensivo: index proviene siempre de un click sobre una opción existente o de highlightedIndex, acotado entre 0 y options.length - 1.
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

  // Reposiciona en scroll/resize y cierra al hacer click fuera del trigger o del listbox
  useEffect(() => {
    if (!isOpen) return;

    const handleReposition = () => computePosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        listboxRef.current?.contains(target)
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
    const optionEl = listboxRef.current?.children[highlightedIndex] as
      | HTMLElement
      | undefined;
    optionEl?.scrollIntoView({ block: "nearest" });
  }, [isOpen, highlightedIndex]);

  const handleTypeahead = (char: string) => {
    const state = typeaheadRef.current;
    window.clearTimeout(state.timeout);
    state.buffer += char.toLowerCase();
    state.timeout = window.setTimeout(() => {
      state.buffer = "";
    }, TYPEAHEAD_RESET_MS);

    const startIndex = isOpen ? highlightedIndex + 1 : 0;
    const ordered = [
      ...options.slice(startIndex),
      ...options.slice(0, startIndex),
    ];
    const match = ordered.find((opt) =>
      opt.label.toLowerCase().startsWith(state.buffer),
    );
    if (!match) return;

    const matchIndex = options.indexOf(match);
    if (isOpen) {
      setHighlightedIndex(matchIndex);
    } else if (multiple) {
      openDropdown(matchIndex);
    } else {
      props.onChange(match.value);
    }
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent) => {
    if (isInert) return;

    if (!isOpen) {
      if (OPEN_KEYS.includes(event.key)) {
        event.preventDefault();
        openDropdown(event.key === "ArrowUp" ? options.length - 1 : undefined);
        return;
      }
      if (event.key.length === 1 && event.key !== " ") {
        handleTypeahead(event.key);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
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
        setHighlightedIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        selectOption(highlightedIndex);
        break;
      case "Escape":
        event.preventDefault();
        closeDropdown();
        break;
      case "Tab":
        closeDropdown(false);
        break;
      default:
        if (event.key.length === 1) handleTypeahead(event.key);
    }
  };

  const dropdown = isOpen && position && (
    <ul
      ref={listboxRef}
      id={listboxId}
      role="listbox"
      aria-labelledby={label ? `${selectId}-label` : undefined}
      aria-multiselectable={multiple || undefined}
      className="select__listbox"
      data-outside-click-ignore=""
      style={{
        position: "fixed",
        left: position.left,
        width: position.width,
        ...(position.placement === "bottom"
          ? { top: position.top }
          : { bottom: window.innerHeight - position.top }),
      }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {options.map((opt, index) => {
        const isSelected = selectedValues.includes(opt.value);
        return (
          <li
            key={opt.value}
            id={`${selectId}-option-${index}`}
            role="option"
            aria-selected={isSelected}
            className={`select__option${
              index === highlightedIndex ? " select__option--highlighted" : ""
            }${isSelected ? " select__option--selected" : ""}`}
            onMouseEnter={() => setHighlightedIndex(index)}
            onClick={() => selectOption(index)}
          >
            <span className="select__option__label">{opt.label}</span>
            {multiple && isSelected && (
              <CheckIcon className="select__option__check" />
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={`select__group ${className ? ` ${className}` : ""}`}>
      {label && (
        <label
          id={`${selectId}-label`}
          className={`select__label ${error && touched ? " label__error" : ""}`}
        >
          {noTranslate ? label : labels(label)}
          {required && <span>*</span>}
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

      <div
        className={`select__wrapper${size === "sm" ? " select__wrapper--sm" : ""}`}
      >
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
          aria-activedescendant={
            isOpen ? `${selectId}-option-${highlightedIndex}` : undefined
          }
          aria-required={required}
          aria-invalid={Boolean(error && touched)}
          disabled={isInert}
          className={`select${error && touched ? " select__error" : ""}`}
          onClick={() => (isOpen ? closeDropdown() : openDropdown())}
          onKeyDown={handleTriggerKeyDown}
        >
          <span
            className={`select__value${!displayLabel && resolvedPlaceholder ? " select__value--placeholder" : ""}`}
          >
            {displayLabel || resolvedPlaceholder}
          </span>
        </button>
        <ChevronDownIcon className="select__icon" />
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
