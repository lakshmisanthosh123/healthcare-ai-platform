export type ID = string;

export interface Pagination {
  page: number;
  pageSize: number;
  total?: number;
}

export interface ProfileDocument {
  name: string;
  type: string;
  dataUrl: string;
  size: number;
}
