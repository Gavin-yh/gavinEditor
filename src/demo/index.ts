
//.https://medium.com/swlh/reimplementing-document-execcommand-6ffc33a80f02
import {  ExecCommandStyle } from './interface'

// 该函数有第二个参数，用来定义其中可以使用该功能的元素
export async function execCommandStyle(action: ExecCommandStyle, containers: string) {
  const selection: Selection | null = await getSelection();
  if (!selection) {
    return;
  }
  const anchorNode: Node = selection.anchorNode;

  if (!anchorNode) {
    return;
  }
  const container: HTMLElement =
    anchorNode.nodeType !== Node.TEXT_NODE 
    && anchorNode.nodeType !== Node.COMMENT_NODE ? 
      (anchorNode as HTMLElement) : anchorNode.parentElement;

  const sameSelection: boolean = container && container.innerText === selection.toString();

  if (sameSelection && !isContainer(containers, container) && container.style[action.style] !== undefined) {
    await updateSelection(container, action, containers);

    return;
  }

  await replaceSelection(container, action, selection, containers);
}


// 获取选区
async function getSelection(): Promise<Selection | null> {
  if (window && window.getSelection) {
    return window.getSelection();
  } else if (document && document.getSelection) {
    return document.getSelection();
  } else if (document && (document as any).selection) {
    return (document as any).selection.createRange().text;
  }

  return null;
}


//当用户应用选择时，例如使用MS Word，我注意到子代应继承新选择。这就是为什么在应用样式后，我创建了另一个函数来清理孩子的样式
async function cleanChildren(action: ExecCommandStyle, span: HTMLSpanElement) {
  if (!span.hasChildNodes()) {
    return;
  }

  // Clean direct (> *) children with same style
  const children: HTMLElement[] = 
        Array.from(span.children)
             .filter((element: HTMLElement) => {
                return element.style[action.style] !== undefined && 
                       element.style[action.style] !== '';
              }) as HTMLElement[];

  if (children && children.length > 0) {
    children.forEach((element: HTMLElement) => {
      element.style[action.style] = '';

      if (element.getAttribute('style') === '' || 
          element.style === null) {
        element.removeAttribute('style');
      }
    });
  }

  // Direct children (> *) may have children (*) to be clean too
  const cleanChildrenChildren: Promise<void>[] = 
    Array.from(span.children).map((element: HTMLElement) => {
      return cleanChildren(action, element);
  });

  if (!cleanChildrenChildren || cleanChildrenChildren.length <= 0) {
    return;
  }

  await Promise.all(cleanChildrenChildren);
}

function isContainer(containers: string, element: Node): boolean {
    const containerTypes: string[] = containers.toLowerCase().split(',');
    return element && element.nodeName && containerTypes.indexOf(element.nodeName.toLowerCase()) > -1;
  }

//该方法递归地进行迭代，直到找到具有相同样式的元素或容器
//容器可以从父级继承其样式，例如<div style =“ font-weight：bold”> <span /> </ div>。这就是为什么我创建了findStyleNode方法
async function findStyleNode(node: Node, style: string, containers: string): Promise<Node | null> {
  // Just in case
  if (node.nodeName.toUpperCase() === 'HTML' || 
     node.nodeName.toUpperCase() === 'BODY') {
    return null;
  }

  if (!node.parentNode) {
    return null;
  }

  if (isContainer(containers, node)) {
    return null;
  }

  const hasStyle: boolean =
    (node as HTMLElement).style[style] !== null && 
    (node as HTMLElement).style[style] !== undefined && 
    (node as HTMLElement).style[style] !== '';

  if (hasStyle) {
    return node;
  }

  return await findStyleNode(node.parentNode, style, containers);
}


async function getStyleValue(container: HTMLElement, action: ExecCommandStyle, containers: string): Promise<string> {
  if (!container) {
    return action.value;
  }

  if (await action.initial(container)) {
    return 'initial';
  }

  const style: Node | null = 
        await findStyleNode(container, action.style, containers);

  if (await action.initial(style as HTMLElement)) {
    return 'initial';
  }

  return action.value;
}

// 更新选中的内容，比如修改样式等等
async function updateSelection(container: HTMLElement, action: ExecCommandStyle, containers: string) {
  container.style[action.style] = await getStyleValue(container, action, containers);

  await cleanChildren(action, container); 
}


//在替换选区时，重新创建一个新的span
//一旦创建了新的跨度并应用了片段，就必须要使用cleanChildren将新样式应用于所有后代。再次幸运的是，该功能与上一章介绍的功能相同
async function createSpan(container: HTMLElement, 
                     action: ExecCommandStyle, 
                     containers: string): Promise<HTMLSpanElement> {
  const span: HTMLSpanElement = document.createElement('span');
  span.style[action.style] = await getStyleValue(container, action, containers);

  return span;
}


//由于要避免没有样式的span元素，因此创建了一个flattenChildren函数，该函数旨在查找新样式的子项，
//并且在清理后不再包含任何样式。如果找到此类元素，则将它们转换回文本节点
async function flattenChildren(action: ExecCommandStyle, 
                               span: HTMLSpanElement) {
  if (!span.hasChildNodes()) {
    return;
  }

  // Flatten direct (> *) children with no style
  const children: HTMLElement[] =    
      Array.from(span.children).filter((element: HTMLElement) => {
         const style: string | null = element.getAttribute('style');
         return !style || style === '';
      }) as HTMLElement[];

  if (children && children.length > 0) {
    children.forEach((element: HTMLElement) => {
      const styledChildren: NodeListOf<HTMLElement> =  
            element.querySelectorAll('[style]');
      if (!styledChildren || styledChildren.length === 0) {
        const text: Text = 
              document.createTextNode(element.textContent);
        element.parentElement.replaceChild(text, element);
      }
    });

    return;
  }

  // Direct children (> *) may have children (*) to flatten too
  const flattenChildrenChildren: Promise<void>[] =  
    Array.from(span.children).map((element: HTMLElement) => {
       return flattenChildren(action, element);
    });

  if (!flattenChildrenChildren || 
      flattenChildrenChildren.length <= 0) {
    return;
  }

  await Promise.all(flattenChildrenChildren);
}

// 替换选区
async function replaceSelection(container: HTMLElement, action: ExecCommandStyle, selection: Selection, containers: string) {
  const range: Range = selection.getRangeAt(0);

  const fragment: DocumentFragment = range.extractContents();

  const span: HTMLSpanElement = await createSpan(container, action, containers);
  span.appendChild(fragment);

  await cleanChildren(action, span);
  await flattenChildren(action, span);

  range.insertNode(span);
  selection.selectAllChildren(span); //将某一指定节点的子节点框入选区。
  
}
 


async function onExecCommand($event: CustomEvent<ExecCommandAction>) {
    // if (!$event || !$event.detail) {
    //   return;
    // }

    // await execCommandStyle(this.selection, $event.detail, this.containers);

    // const container: HTMLElement = await DeckdeckgoInlineEditorUtils.findContainer(
    //   this.containers,
    //   !this.selection ? document.activeElement : this.selection.anchorNode
    // );
    // this.styleDidChange.emit(container);

    // await this.reset(true);
}

function exe () {
    // <deckgo-ie-style-actions
    //     mobile={this.mobile}
    //     disabledTitle={this.disabledTitle}
    //     selection={this.selection}
    //     bold={this.bold === 'bold'}
    //     italic={this.italic === 'italic'}
    //     underline={this.underline === 'underline'}
    //     strikethrough={this.strikethrough === 'strikethrough'}
    //     onExecCommand={($event: CustomEvent<ExecCommandAction>) => this.onExecCommand($event)}></deckgo-ie-style-actions>,
    // />
}

















