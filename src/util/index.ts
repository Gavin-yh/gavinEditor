import Editor from '../editor/index'

export function initDom(editor: Editor): Editor {
  this.$containerDom
  return editor
}

export function setStyle(dom: HTMLElement, style: CSSStyleDeclaration):void {
  for(let key in style) {
    dom.style[key] = style[key]
  }
}

// export function createDom(elementTag: string, attr?: Object, childrens?:  ): HTMLElement {

// }