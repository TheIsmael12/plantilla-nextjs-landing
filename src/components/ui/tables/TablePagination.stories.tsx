import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import TablePagination from "./TablePagination";

/**
 * `pageInfo` se renderiza con `t.rich(...)`, que envuelve los números en
 * `<strong>`: el texto queda repartido en varios nodos de texto y
 * `getByText` con un string/regex simple nunca lo encuentra, porque solo
 * compara el texto propio de cada nodo (no el de sus hijos). Este matcher
 * busca el nodo más específico cuyo `textContent` completo cumple `re` pero
 * ninguno de sus hijos directos lo cumple ya por sí solo, evitando además
 * que un ancestro (que también "contiene" ese texto por concatenación)
 * produzca coincidencias múltiples.
 */
function textSplitAcrossElements(re: RegExp) {
  return (_content: string, node: Element | null) => {
    if (!node) return false;
    const hasMatch = (el: Element) => re.test(el.textContent ?? "");
    return (
      hasMatch(node) &&
      Array.from(node.children).every((child) => !hasMatch(child))
    );
  };
}

/** Envuelve TablePagination con el estado que normalmente le proporciona `Table`/TanStack Table, para que sea interactivo en el canvas. */
function TablePaginationDemo({
  pageCount,
  totalRecords,
  pageSizeOptions = [10, 25, 50, 100],
  initialPageIndex = 0,
  initialPageSize = 10,
}: {
  pageCount: number;
  totalRecords: number;
  pageSizeOptions?: number[];
  initialPageIndex?: number;
  initialPageSize?: number;
}) {
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const [pageSize, setPageSize] = useState(initialPageSize);

  return (
    <TablePagination
      currentPage={pageIndex + 1}
      pageCount={pageCount}
      totalRecords={totalRecords}
      canPreviousPage={pageIndex > 0}
      canNextPage={pageIndex < pageCount - 1}
      onFirstPage={() => setPageIndex(0)}
      onPreviousPage={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
      onNextPage={() =>
        setPageIndex((prev) => Math.min(prev + 1, pageCount - 1))
      }
      onLastPage={() => setPageIndex(pageCount - 1)}
      onGoToPage={(page) => setPageIndex(page - 1)}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      onPageSizeChange={setPageSize}
    />
  );
}

const meta = {
  title: "UI/Tables/TablePagination",
  component: TablePaginationDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Pie de tabla de `Table`: resumen de registros, navegación entre páginas (con ventana de páginas centrada en la actual) y selector de tamaño de página. Es puramente controlado, sin estado propio (`currentPage`/`pageSize` y los booleanos `canPreviousPage`/`canNextPage` los calcula siempre quien lo usa); esta story añade el estado mínimo con `useState` para que sea interactivo en el canvas, igual que haría `Table` internamente. Cada botón de navegación resuelve su `aria-label` desde el namespace `Table` de next-intl, y la página activa se marca con `aria-current=\"page\"`.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    pageCount: {
      control: "number",
      description: "Total de páginas disponibles.",
    },
    totalRecords: {
      control: "number",
      description:
        "Total de registros sin paginar, mostrado en el resumen (\"Página X de Y · Z registros\").",
    },
    pageSizeOptions: {
      control: false,
      description:
        "Opciones ofrecidas en el selector de tamaño de página. Si `initialPageSize` no está entre ellas, el componente la añade igualmente y reordena la lista.",
    },
    initialPageIndex: {
      control: "number",
      description:
        "Página inicial mostrada al montar la demo, en base 0. Solo existe en esta story: el componente real siempre recibe `currentPage` en base 1 desde fuera.",
    },
    initialPageSize: {
      control: "number",
      description:
        "Tamaño de página inicial mostrado al montar la demo. Solo existe en esta story.",
    },
  },
  args: {
    pageCount: 5,
    totalRecords: 47,
  },
} satisfies Meta<typeof TablePaginationDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ManyPages: Story = {
  name: "Ventana de páginas (al inicio)",
  args: { pageCount: 24, totalRecords: 236 },
};

export const CenteredWindow: Story = {
  name: "Ventana de páginas centrada",
  parameters: {
    docs: {
      description: {
        story:
          "Con la página actual lejos de ambos extremos, la ventana de 5 números se centra en ella (`getPageWindow`).",
      },
    },
  },
  args: { pageCount: 24, totalRecords: 236, initialPageIndex: 11 },
};

export const WindowNearEnd: Story = {
  name: "Ventana de páginas pegada al final",
  parameters: {
    docs: {
      description: {
        story:
          "Cerca del final, la ventana deja de recentrarse y se ajusta para no sobrepasar el total de páginas.",
      },
    },
  },
  args: { pageCount: 24, totalRecords: 236, initialPageIndex: 23 },
};

export const FirstPage: Story = {
  name: "Primera página",
  args: { initialPageIndex: 0 },
};

export const LastPage: Story = {
  name: "Última página",
  args: { initialPageIndex: 4 },
};

export const SinglePage: Story = {
  name: "Una sola página",
  args: { pageCount: 1, totalRecords: 6 },
};

export const NoRecords: Story = {
  name: "Sin registros",
  parameters: {
    docs: {
      description: {
        story:
          "`Table` siempre fuerza `pageCount >= 1` incluso sin filas, así que el pie de paginación se muestra igualmente con la navegación deshabilitada.",
      },
    },
  },
  args: { pageCount: 1, totalRecords: 0 },
};

export const PageSizeOutOfOptions: Story = {
  name: "Tamaño de página fuera de las opciones",
  parameters: {
    docs: {
      description: {
        story:
          "Si `pageSize` no está entre `pageSizeOptions`, el componente lo añade igualmente al selector (aquí, 15 entre 10 y 25) en vez de perder el valor actual.",
      },
    },
  },
  args: { initialPageSize: 15, pageSizeOptions: [10, 25, 50, 100] },
};

export const NextPageInteraction: Story = {
  name: "Interacción: página siguiente",
  parameters: {
    docs: {
      description: {
        story:
          "Al hacer clic en «Página siguiente» avanza una página: el número activo (`aria-current`) cambia y «Página anterior» pasa a estar habilitado.",
      },
    },
  },
  args: { pageCount: 5, totalRecords: 47, initialPageIndex: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nextButton = canvas.getByRole("button", {
      name: /página siguiente/i,
    });
    const previousButton = canvas.getByRole("button", {
      name: /página anterior/i,
    });

    await expect(previousButton).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: "Ir a la página 1" }),
    ).toHaveAttribute("aria-current", "page");

    await userEvent.click(nextButton);

    await expect(
      canvas.getByRole("button", { name: "Ir a la página 2" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(previousButton).toBeEnabled();
  },
};

export const GoToPageInteraction: Story = {
  name: "Interacción: ir a una página numerada",
  parameters: {
    docs: {
      description: {
        story:
          "Al hacer clic directamente en un número de página, `currentPage` salta a esa página sin pasar por las intermedias.",
      },
    },
  },
  args: { pageCount: 5, totalRecords: 47, initialPageIndex: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Ir a la página 4" }),
    );

    await expect(
      canvas.getByRole("button", { name: "Ir a la página 4" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      canvas.getByText(textSplitAcrossElements(/página 4 de 5/i)),
    ).toBeInTheDocument();
  },
};

export const FirstLastInteraction: Story = {
  name: "Interacción: primera y última página",
  parameters: {
    docs: {
      description: {
        story:
          "«Última página» salta directamente al final (deshabilitando «siguiente»/«última»); «Primera página» vuelve al principio (deshabilitando «anterior»/«primera»).",
      },
    },
  },
  args: { pageCount: 5, totalRecords: 47, initialPageIndex: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstButton = canvas.getByRole("button", { name: /primera página/i });
    const lastButton = canvas.getByRole("button", { name: /última página/i });
    const nextButton = canvas.getByRole("button", { name: /página siguiente/i });
    const previousButton = canvas.getByRole("button", {
      name: /página anterior/i,
    });

    await userEvent.click(lastButton);

    await expect(
      canvas.getByRole("button", { name: "Ir a la página 5" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(nextButton).toBeDisabled();
    await expect(lastButton).toBeDisabled();

    await userEvent.click(firstButton);

    await expect(
      canvas.getByRole("button", { name: "Ir a la página 1" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(previousButton).toBeDisabled();
    await expect(firstButton).toBeDisabled();
  },
};

export const DisabledEdgeNavigation: Story = {
  name: "Interacción: en los extremos los controles no hacen nada",
  parameters: {
    docs: {
      description: {
        story:
          "En la última página, «siguiente» y «última» están deshabilitados y no responden al clic (igual que cualquier `<button disabled>` nativo).",
      },
    },
  },
  args: { pageCount: 5, totalRecords: 47, initialPageIndex: 4 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nextButton = canvas.getByRole("button", { name: /página siguiente/i });
    const lastButton = canvas.getByRole("button", { name: /última página/i });

    await expect(nextButton).toBeDisabled();
    await expect(lastButton).toBeDisabled();

    await userEvent.click(nextButton);
    await userEvent.click(lastButton);

    await expect(
      canvas.getByRole("button", { name: "Ir a la página 5" }),
    ).toHaveAttribute("aria-current", "page");
  },
};

export const PageSizeChangeInteraction: Story = {
  name: "Interacción: cambiar tamaño de página",
  parameters: {
    docs: {
      description: {
        story:
          "El selector «Filas por página» es un `Select` accesible: su nombre accesible lo aporta el `<label>` que lo envuelve. Al elegir una opción se actualiza el valor mostrado.",
      },
    },
  },
  args: { pageCount: 5, totalRecords: 47 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pageSizeSelect = canvas.getByRole("combobox", {
      name: /filas por página/i,
    });

    await expect(pageSizeSelect).toHaveTextContent("10");

    await userEvent.click(pageSizeSelect);

    const listbox = within(document.body).getByRole("listbox");
    await userEvent.click(within(listbox).getByRole("option", { name: "25" }));

    await expect(pageSizeSelect).toHaveTextContent("25");
  },
};
