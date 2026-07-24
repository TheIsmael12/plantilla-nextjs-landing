"use client";

import "@/styles/04-components/ui/inputs/change-locale.scss";

import Image from "next/image";
import {
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { ChangeLocaleProps } from "@/types/ui/inputs/change-locale";

import { CheckIcon, ChevronDownIcon } from "lucide-react";

const OPEN_KEYS = ["ArrowDown", "ArrowUp", "Enter", " "];

/** Posición calculada del desplegable respecto al viewport (portal a document.body). */
interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  placement: "bottom" | "top";
}

/**
 * Selector de idioma accesible (combobox) con banderas: gestiona apertura/cierre
 * con teclado y ratón, y renderiza el listado de opciones en un portal a
 * `document.body` para evitar problemas de recorte/overflow.
 * @param {ChangeLocaleProps} props - Propiedades del componente
 * @returns {JSX.Element} El selector de idioma renderizado
 */
export default function ChangeLocale({
  id,
  name,
  label,
  description,
  value,
  options,
  onChange,
  disabled,
  hideSelectedFromList = false,
  className,
}: ChangeLocaleProps) {
  const reactId = useId();
  const selectId = id ?? reactId;
  const listboxId = `${selectId}-listbox`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  const [mounted, setMounted] = useState(false);

  // El portal solo puede montarse tras la hidratación: `document` ya existe
  // en el primer render del cliente (a diferencia del servidor), así que
  // condicionar el portal a `typeof document !== "undefined"` provocaría un
  // mismatch de hidratación (servidor sin portal, cliente con portal).
  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  // El trigger siempre resuelve `selectedOption` sobre `options` (arriba), tal
  // cual; el listado desplegable, en cambio, se calcula sobre `listOptions`,
  // que solo difiere cuando `hideSelectedFromList` está activo.
  const listOptions = hideSelectedFromList
    ? options.filter((opt) => opt.value !== value)
    : options;
  const listSelectedIndex = listOptions.findIndex((opt) => opt.value === value);

  const computePosition = () => {
    const trigger = triggerRef.current;
    /* v8 ignore next -- defensivo: computePosition solo se invoca desde manejadores (click/teclado/scroll/resize) que solo se disparan con el trigger ya montado */
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placement: DropdownPosition["placement"] =
      spaceBelow < 240 && spaceAbove > spaceBelow ? "top" : "bottom";

    setPosition({
      top: placement === "bottom" ? rect.bottom + 8 : rect.top - 8,
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
    if (disabled || listOptions.length === 0) return;
    computePosition();
    setHighlightedIndex(
      initialIndex ?? (listSelectedIndex >= 0 ? listSelectedIndex : 0),
    );
    setIsOpen(true);
  };

  const selectOption = (index: number) => {
    const option = listOptions[index];
    /* v8 ignore next -- defensivo: index siempre viene acotado a [0, listOptions.length-1] por los propios manejadores de teclado/ratón */
    if (!option) return;
    if (option.value !== value) onChange(option.value);
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

  const handleTriggerKeyDown = (event: ReactKeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (OPEN_KEYS.includes(event.key)) {
        event.preventDefault();
        openDropdown(event.key === "ArrowUp" ? listOptions.length - 1 : undefined);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, listOptions.length - 1));
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
        setHighlightedIndex(listOptions.length - 1);
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
    }
  };

  // Se renderiza siempre (oculto con `hidden` mientras está cerrado), en vez
  // de montarse/desmontarse con `isOpen`: el trigger declara `aria-controls`
  // de forma permanente (exigido por su `role="combobox"`), así que el id al
  // que apunta debe existir en el DOM también cuando el combobox está cerrado.
  const dropdown = (
    <ul
      ref={listboxRef}
      id={listboxId}
      role="listbox"
      hidden={!isOpen}
      // Sin nombre accesible propio a propósito: en el patrón combobox con
      // `aria-activedescendant` el listbox nunca recibe foco directamente
      // (se navega desde el botón), así que un lector de pantalla nunca lo
      // anuncia como un control independiente. Reutilizar aquí el mismo
      // `aria-labelledby` que el trigger creaba dos elementos con idéntico
      // nombre accesible (WCAG 2.4.6, "Duplicate labels").
      className="change-locale__listbox"
      data-outside-click-ignore=""
      style={
        isOpen && position
          ? {
              position: "fixed",
              left: position.left,
              width: position.width,
              ...(position.placement === "bottom"
                ? { top: position.top }
                : { bottom: window.innerHeight - position.top }),
            }
          : undefined
      }
      onMouseDown={(event) => event.preventDefault()}
    >
      {listOptions.map((opt, index) => (
        <li
          key={opt.value}
          id={`${selectId}-option-${index}`}
          role="option"
          aria-selected={opt.value === value}
          className={`change-locale__option${
            index === highlightedIndex
              ? " change-locale__option--highlighted"
              : ""
          }${opt.value === value ? " change-locale__option--selected" : ""}`}
          onMouseEnter={() => setHighlightedIndex(index)}
          onClick={() => selectOption(index)}
        >
          <span className="change-locale__option__flag">
            <Image src={opt.flag} alt="" fill sizes="28px" />
          </span>
          <span className="change-locale__option__label">{opt.label}</span>
          {opt.value === value && (
            <CheckIcon className="change-locale__option__check" />
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`change-locale${className ? ` ${className}` : ""}`}>
      {label && (
        <span id={`${selectId}-label`} className="change-locale__sr-label">
          {label}
        </span>
      )}

      {name && <input type="hidden" name={name} value={value} />}

      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        // `role="combobox"` exige `aria-controls` siempre presente; el
        // listbox al que apunta se renderiza siempre (oculto con `hidden`
        // mientras está cerrado, ver más abajo) para que el id nunca quede
        // huérfano.
        aria-controls={listboxId}
        aria-labelledby={label ? `${selectId}-label` : `${selectId}-value`}
        aria-activedescendant={
          isOpen ? `${selectId}-option-${highlightedIndex}` : undefined
        }
        disabled={disabled}
        className={`change-locale__trigger${
          isOpen ? " change-locale__trigger--open" : ""
        }`}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="change-locale__trigger__flag">
          {selectedOption && (
            <Image src={selectedOption.flag} alt="" fill sizes="32px" />
          )}
        </span>
        {/*
          Sin `label`, este span (referenciado por `aria-labelledby` arriba)
          es quien aporta el nombre accesible del combobox: `role="combobox"`
          no admite "name from content", así que el texto visible no basta
          por sí solo y hace falta esta referencia explícita.
        */}
        <span id={`${selectId}-value`} className="change-locale__trigger__label">
          {selectedOption?.label ?? ""}
        </span>
        <ChevronDownIcon className="change-locale__trigger__chevron" />
      </button>

      {description && (
        <p className="change-locale__description">{description}</p>
      )}

      {mounted && createPortal(dropdown, document.body)}
    </div>
  );
}
