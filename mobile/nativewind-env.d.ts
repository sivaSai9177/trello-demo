/// <reference types="nativewind/types" />

// CSS module declarations for NativeWind
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '@/global.css' {
  const content: Record<string, string>;
  export default content;
}
