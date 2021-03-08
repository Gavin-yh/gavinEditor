
import { setStyle } from '../util/index'
import { Menu } from '../menu/index'
import { Text } from '../text/index'

let UNI_ID = 1

class Editor {
    private id : string

    public $containerDom: HTMLElement //用户传入，用于挂着编辑器的容器
    public $menuDom: Menu
    public $textDom:Text // 编辑区Dom元素
    public $rangeCatch: Range

    constructor(id: string) {
        const containerDom: HTMLElement = document.getElementById(id)

        if(!containerDom) {
            throw new Error('请传入编辑器挂载的容器id')
        }

        this.id = `Editor_${UNI_ID}`
        this.$containerDom = containerDom
        this.$menuDom = new Menu(this)
        this.$textDom = new Text(this)
    }

    private initDom(editor: Editor): Editor {
        setStyle(editor.$containerDom, {
            width: '900px',
            height: '400px',
            border: '1px solid #eee',
            margin: '0 auto',
        } as CSSStyleDeclaration)

        return editor
    }

    public create():void {
        this.initDom(this)

        this.$menuDom.init()

        this.$textDom.init()
    }
}

export default Editor
