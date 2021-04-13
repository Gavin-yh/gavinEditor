## document.execCommand缺点
> 参考: https://segmentfault.com/q/1010000022841994

确切的说这个 API 本来也不是标准 API，而是一个 IE 的私有 API，在 IE9 时被引入，后续的若干年里陆续被 Chrome / Firefix / Opera 等浏览器也做了兼容支持，但始终没有形成标准。

这个 API 被废弃的主要原因第一个就是安全问题，在用户未经授权的情况下就可以执行一些敏感操作，这就很恐怖了；第二个问题是因为这是一个同步方法，而且操作了 DOM 对象，会阻塞页面渲染和脚本执行，因当初还没 Promise，所以没设计成异步，挖坑了。新设计的 API 肯定是要解决这两个问题。

不过 W3C 也正在拟草案，大概率以后会引入一个叫 Clipboard 的类型（Chrome 66.0 开始已经有这个类型了，不过还不能用，相关 API 仅存在于文档中），用来处理跟剪贴版相关的操作，不过之后肯定会是像现在获取地理位置啊、麦克风啊什么的，浏览器先会弹出一个对话框让用户授权，你才能读写剪贴板了。

**clipboard参考：** 目前用这个也待考虑，谷歌现在支持了，但是其他浏览器的兼容性并不是很好。

[W3C Clipboard 草案](https://www.w3.org/TR/clipboard-apis/)
[Google Clipboard API 文档](https://web.dev/async-clipboard/)
[MDN Clipboard API 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Clipboard)

**document.execCommand主要探究的点**
* 兼容性问题，已经废弃了，不是标准
* 安全问题
* 这个api是同步的，而且操作dom, 会阻塞渲染和脚本执行


**如果要设计方案替代这个api，需要做的点**
* 解决安全问题
* 提供异步操作的功能： Promise, 异步的promise就需要考虑在ie下怎么支持。

