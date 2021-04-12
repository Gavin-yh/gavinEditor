export interface ExecCommandStyle {
  style: 'color' | 
         'background-color' | 
         'font-size' | 
         'font-weight' | 
         'font-style' | 
         'text-decoration';
  value: string;
  initial: (element: HTMLElement | null) => Promise<boolean>;// 该函数的作用就是，用来确定，样式是否该应用，或者该删除
}