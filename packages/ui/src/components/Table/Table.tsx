import type { ReactNode } from "react";
import "./Table.css";

export interface Column<T> {
  header: string;
  key: keyof T;
  align?: "left" | "center" | "right";
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
}

export function Table<T extends object>({
  columns,
  data,
  className = "",
}: TableProps<T>) {
  return (
    <div className={["ui-table-wrapper", className].join(" ").trim()}>
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`ui-table__head ${column.align ? `ui-table__head--${column.align}` : ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => {
                const cellValue = row[column.key];
                return (
                  <td
                    key={String(column.key)}
                    className={`ui-table__cell ${column.align ? `ui-table__cell--${column.align}` : ""}`}
                  >
                    {column.render
                      ? column.render(cellValue, row)
                      : String(cellValue ?? "")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
