import Editor from '../editor/index'

interface MenuListConfig {
  title?: string,
  icon?: string,
  childrens?: Array<MenuListConfig>
  command?: string,
  value?: string
}

const config: Array<MenuListConfig> = [
  {
    title: '设置标题',
    icon: 'icon-waimai',
    childrens: [{
      icon: 'icon-h1',
      command: 'fontSize',
      value: '6'
    },{
      icon: 'icon-h2',
      command: 'fontSize',
      value: '5'
    }, {
      icon: 'icon-h3',
      command: 'fontSize',
      value: '4'
    }, {
      icon: 'icon-h4',
      command: 'fontSize',
      value: '3'
    }, {
      icon: 'icon-h5',
      command: 'fontSize',
      value: '2'
    }, {
      icon: 'icon-h6',
      command: 'fontSize',
      value: '1'
    }]
  },
  {
    icon: 'icon-bold',
    command: 'bold',
    
  },
  {
    icon: 'icon-xieti',
    command: 'italic'
  },
  {
    icon: 'icon-Underline',
    command: 'underline'
  },
  {
    icon: 'icon-biji',
    childrens: [{
      command: 'foreColor',
      value: 'red'
    },{
      command: 'foreColor',
      value: 'green'
    }]
  } 
]

export class Menu {
  public editor: Editor
  public menuContainer: HTMLElement

  constructor(editor: Editor) {
    this.editor = editor
    this.menuContainer = document.createElement('div')
  }

  private createMenu (config: Array<MenuListConfig>): DocumentFragment {
    let fragment: DocumentFragment

    let childItem: HTMLElement  // 每个子项的容器

    let resultContain: DocumentFragment = document.createDocumentFragment()//最终生成的dom容器

    for(let item of config) {
      fragment = document.createDocumentFragment();
      childItem = document.createElement('div')
      const i = document.createElement('i')

      if(item.icon) {
        i.classList.add('iconfont', item.icon)
      } else { //针对没有icon，的操作, 根据具体配置具体分析
        i.style.width = '100%',
        i.style.height = '10px'
        i.style.display = 'inline-block'
        i.style.background = item.value
      }

      //设置命令，和值
      if (item.command || item.value) {
        i.dataset.command = item.command //将命令设置 到data-*上
        item.value && (i.dataset.value = item.value) // 有可能没有值
      }

      fragment.appendChild(i) //将创建的i先插入的片段中

      if(item.childrens) {
        const menuChildContainer = document.createElement('div') //子项的最外层容器
        const menuChildren: DocumentFragment = this.createMenu(item.childrens)
        menuChildContainer.appendChild(menuChildren)
        menuChildContainer.classList.add('menu-item-container')
        fragment.appendChild(menuChildContainer)
      }

      childItem.appendChild(fragment)

      resultContain.appendChild(childItem)
    }

    return resultContain
  }
  
  //TODO  提供自定义菜单
  init(customList?: MenuListConfig):void {
    // TODO merge  customList

    const editor: Editor = this.editor

    const menuItem: DocumentFragment = this.createMenu(config)

    this.menuContainer.appendChild(menuItem)
    this.menuContainer.classList.add('menu-wrapper')
    editor.$containerDom.appendChild(this.menuContainer)

    this.initEvent()
  }
  
  initEvent():void {
   const menuContainer = this.menuContainer

   menuContainer.addEventListener('click', (e) => {
     const target: HTMLElement = e.target as HTMLElement

     const command = target.dataset.command
     const value = target.dataset.value

     let select = window.getSelection()

     select.removeAllRanges()
     if (this.editor.$rangeCache) {
      select.addRange(this.editor.$rangeCache)
     }
      
     document.execCommand(command, false, value)
   })
  }
}



