import Editor from '../editor/index'
import { setStyle } from '../util/index'

export class Text {
  public editor: Editor
  public TextContainer: HTMLElement

  constructor(editor: Editor) {
    this.editor = editor
    this.TextContainer = document.createElement('div')
  }

  init(): void {
    setStyle(this.TextContainer, {
      border: '1px solid #eee',
    } as CSSStyleDeclaration)

    this.TextContainer.classList.add('text-wrapper')

    this.TextContainer.contentEditable = "true"

    this.editor.$containerDom.appendChild(this.TextContainer)

    this.initSelect()
  }

  public initSelect():void {
    //TODO 保存选区的内容，执行相应的命令

    this.TextContainer.addEventListener("mouseup", e => {
        this.editor.$rangeCache = window.getSelection().getRangeAt(0)
    })
  }
}
