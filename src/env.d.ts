declare namespace App {
  interface Locals {
    /**
     * True when the CMS deployment renders unpublished drafts. Set by `src/middleware.ts`;
     * always false on prerendered pages (the whole production build).
     */
    draftMode?: boolean;
  }
}
