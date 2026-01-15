declare global {
  namespace JSX {
    interface Element {}
  }

  type TaroComponent = (props: Record<string, unknown>) => JSX.Element

  const View: TaroComponent
  const ScrollView: TaroComponent
  const Text: TaroComponent
  const Image: TaroComponent
  const Input: TaroComponent
  const Picker: TaroComponent
}

declare module '@tarojs/components' {
  export const View: TaroComponent
  export const ScrollView: TaroComponent
  export const Text: TaroComponent
  export const Image: TaroComponent
  export const Input: TaroComponent
  export const Picker: TaroComponent
}

export {}
