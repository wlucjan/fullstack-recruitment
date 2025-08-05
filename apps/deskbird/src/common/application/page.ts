export class Page {
  page: number;
  limit: number;

  constructor(page: number, limit: number) {
    this.page = page;
    this.limit = limit;
  }

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}

export class PageMetadata {
  total: number;
  totalPages: number;
  limit: number;
  page: number;
  hasPrevious: boolean;
  hasNext: boolean;

  constructor(total: number, limit: number, page: number) {
    this.page = page ?? 1;
    this.limit = limit ?? 10;
    this.total = total;
    this.totalPages = Math.ceil(this.total / this.limit);
    this.hasPrevious = this.page > 1;
    this.hasNext = this.page < this.totalPages;
  }
}

export class PaginatedResult<T> {
  result: T[];
  totalCount: number;

  constructor(result: T[], totalCount: number) {
    this.result = result;
    this.totalCount = totalCount;
  }
}
