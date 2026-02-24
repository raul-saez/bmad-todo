import { structuredClone as nodeStructuredClone } from 'node:util'

if (typeof globalThis.structuredClone !== 'function') {
  Object.defineProperty(globalThis, 'structuredClone', {
    value: nodeStructuredClone,
    writable: true,
    configurable: true,
  })
}
