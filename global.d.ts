import 'react';
import type { AppKit } from '@reown/appkit'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      /**
       * The AppKit button web component. Registered globally by AppKit.
       */
      'appkit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
  
  interface Window {
    /**
     * Global Reown AppKit instance for programmatic modal control
     * @example
     * // Open the wallet connection modal
     * window.reownAppKit?.open()
     * 
     * // Close the modal
     * window.reownAppKit?.close()
     */
    reownAppKit?: AppKit;
  }
}

// Ensures file is treated as a module
export {};