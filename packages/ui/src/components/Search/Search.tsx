import type { FC } from "react";
import "./Search.css";

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
}

export const Search: FC<SearchProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  onSearch,
}) => {
  return (
    <div className="ui-search">
      <input
        className="ui-search__input"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && onSearch) {
            onSearch();
          }
        }}
      />
      {onSearch ? (
        <button type="button" className="ui-search__button" onClick={onSearch}>
          Search
        </button>
      ) : null}
    </div>
  );
};
