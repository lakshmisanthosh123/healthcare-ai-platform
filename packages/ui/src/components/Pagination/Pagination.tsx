import type { FC } from "react";
import "./Pagination.css";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const handlePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="ui-pagination">
      <button
        className="ui-pagination__button"
        onClick={() => handlePage(currentPage - 1)}
        disabled={!canPrev}
      >
        Previous
      </button>
      <span className="ui-pagination__info">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="ui-pagination__button"
        onClick={() => handlePage(currentPage + 1)}
        disabled={!canNext}
      >
        Next
      </button>
    </div>
  );
};
