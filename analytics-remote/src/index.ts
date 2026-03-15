/**
 * Module Federation entry point.
 * Webpack loads this file first; it asynchronously imports bootstrap.tsx
 * so shared singletons (react, react-dom) are negotiated before any code runs.
 */
import('./bootstrap')
