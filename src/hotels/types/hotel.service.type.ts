export interface ImportError {
  row: number;
  errors: string[];
}

export interface ImportRecord {
  row: number;
}

export interface ImportResult {
  successRecords: ImportRecord[];
  errorRecords: ImportError[];
}
