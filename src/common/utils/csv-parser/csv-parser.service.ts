import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

// csv-parse:
// https://github.com/adaltas/node-csv-docs/blob/master/src/md/parse/examples/async_iterator.md
// https://csv.js.org/parse/options
@Injectable()
export class CsvParserService {
  async parseCsvFromBuffer(buffer: Buffer): Promise<Record<string, string>[]> {
    const readableStream = Readable.from(buffer);

    const parser = readableStream.pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
      }),
    );

    const records: Record<string, string>[] = [];
    try {
      for await (const record of parser) {
        records.push(record);
      }
    } catch (error) {
      throw error;
    }
    return records;
  }
}
