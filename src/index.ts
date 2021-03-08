import GEditor from './editor/index'
import './index.css'

if (!window) {
  throw new Error('该环境中不支持editor')
} else {
  Object.defineProperty(window, 'Editor', {
    value: GEditor,
    writable: false,
    configurable: false,
  })
}


