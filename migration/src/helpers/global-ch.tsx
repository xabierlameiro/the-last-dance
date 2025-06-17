import { CHCode } from '../components/CodeLegacy'

// Make CH available globally for MDX files
declare global {
   
  var CH: {
    Code: typeof CHCode
  }
}

// Export CH object for global use  
export const CH = {
  Code: CHCode,
}

// Make it available on globalThis
if (typeof globalThis !== 'undefined') {
  globalThis.CH = CH
}
