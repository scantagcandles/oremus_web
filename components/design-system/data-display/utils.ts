import { cva } from "class-variance-authority";

export const tableBase = cva(["w-full", "border-collapse"], {
  variants: {
    variant: {
      default: "",
      glass: "bg-white/5 backdrop-blur-md",
    },
    density: {
      compact: "",
      comfortable: "",
      spacious: "",
    },
    bordered: {
      true: "border border-white/20",
      false: "",
    },
    striped: {
      true: "[&_tr:nth-child(odd)]:bg-white/5",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    density: "comfortable",
    bordered: true,
    striped: false,
  },
});

export const tableCellBase = cva(
  ["p-4", "text-left", "transition-colors duration-200"],
  {
    variants: {
      variant: {
        default: "",
        glass: "",
      },
      density: {
        compact: "p-2",
        comfortable: "p-4",
        spacious: "p-6",
      },
      bordered: {
        true: "border border-white/20",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      density: "comfortable",
      bordered: true,
    },
  }
);

export const tableHeaderBase = cva(
  ["font-medium", "text-white", "bg-white/10"],
  {
    variants: {
      variant: {
        default: "",
        glass: "backdrop-blur-md",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      sortable: {
        true: "cursor-pointer hover:bg-white/20",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      align: "left",
      sortable: false,
    },
  }
);

export const tableRowBase = cva(["transition-colors duration-200"], {
  variants: {
    variant: {
      default: "hover:bg-white/5",
      glass: "hover:bg-white/10",
    },
    selected: {
      true: "bg-primary-500/20 hover:bg-primary-500/30",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    selected: false,
  },
});

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface Column<T> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string | number;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
}
