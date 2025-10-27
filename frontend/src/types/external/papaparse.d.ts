declare module 'papaparse' {
  export interface ParseResult {
    data: unknown[];
  }
  export interface ParseError {
    message: string;
  }
  export interface ParseConfig {
    header?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    complete?: (result: ParseResult) => void;
    error?: (error: ParseError) => void;
  }
  export function parse(file: File, config: ParseConfig): void;
  const Papa: { parse: typeof parse };
  export default Papa;
}
