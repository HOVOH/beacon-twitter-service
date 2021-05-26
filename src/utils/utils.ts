export function isObjectEmpty(o: any){
  return Object.keys(o).length === 0;
}

export function split(string: string): string[]{
  return string? string.split(","):null;
}
