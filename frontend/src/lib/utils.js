// Simple utility to join class names
export function cn(...args) {
  return args
    .flatMap(arg => {
      if (!arg) return [];
      if (typeof arg === "string") return [arg];
      if (Array.isArray(arg)) return arg;
      if (typeof arg === "object") {
        return Object.entries(arg)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    })
    .filter(Boolean)
    .join(" ");
}
