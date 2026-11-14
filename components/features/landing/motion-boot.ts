/**
 * Inline script for the landing page. Kept out of the client module so the server
 * component can read the string.
 */

/** Runs before paint so content below the fold never flashes in and out. */
export const MOTION_BOOT_SCRIPT = `(function(){try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var d=document.documentElement;d.classList.add('motion-ready');setTimeout(function(){if(!window.__hopeMotion)d.classList.remove('motion-ready')},4000)}catch(e){}})()`;
