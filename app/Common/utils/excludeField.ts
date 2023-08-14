export function excludeField<T, Key extends keyof T>($attributes: T, keys: Key[]) {
  return Object.fromEntries(
    Object.entries($attributes!).filter(([key]) => !keys.includes(key! as Key))
  );
}
