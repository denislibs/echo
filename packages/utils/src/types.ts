export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export function isDefined<T>(value: Maybe<T>): value is T {
  return value !== null && value !== undefined;
}

export function isNull<T>(value: Maybe<T>): value is null {
  return value === null;
}

export function isUndefined<T>(value: Maybe<T>): value is undefined {
  return value === undefined;
}

