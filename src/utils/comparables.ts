export interface IComparable<T> {
  compareTo(object: T): number
  equals(object: T): boolean
}

export interface IUpdatable<T> {
  needsUpdate(comparedTo: T): boolean

  mergeChange(newVersion: T): void
}
