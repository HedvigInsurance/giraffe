export interface TableRow {
    title: string;
    subtitle: string | null;
    value: string;
  }
  
export interface TableSection {
    title: string;
    rows: TableRow[];
  }
  
export interface Table {
    title: string;
    sections: TableSection[];
  }