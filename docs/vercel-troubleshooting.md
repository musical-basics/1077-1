# Vercel Deployment Troubleshooting

This document outlines common build errors encountered when deploying this Next.js App Router project to Vercel, and how to fix them.

## 1. Prisma Client Missing Type Errors
**Error:** 
`Type error: Module '"@prisma/client"' has no exported member 'User'.`

**Cause:** 
Vercel caches `node_modules` between builds, occasionally omitting the generated `.prisma` client, or simply fails to generate the Prisma client before running Next.js's type-checking phase during `pnpm build`.

**Fix:** 
Ensure that `package.json` contains a `postinstall` script that instructs Vercel to generate the Prisma types immediately after installing dependencies.
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

## 2. "Implicit Any" Type Errors in `.map()` loops
**Error:** 
`Type error: Parameter 'log' implicitly has an 'any' type.`

**Cause:** 
Vercel's `tsc` type-checker runs under strict adherence via `tsconfig.json`. When mapping over arrays in a React component, if TypeScript cannot firmly infer the type returned by `Promise.all` or a database query (sometimes due to deeply nested server components), it defaults to `any` and triggers a build failure.

**Fix:** 
Explicitly import the model type and declare it in the map loop.
```tsx
// ❌ Fails on Vercel
{workLogs.map(log => ( ... ))}

// ✅ Fix: Add the explicit type
import type { WorkLog } from '@/actions/work-log'
{workLogs.map((log: WorkLog) => ( ... ))}
```

## 3. Clerk `<SignInButton>` Child Element Errors
**Error:** 
`Error: @clerk/react: You've passed multiple children components to <SignInButton/>. You can only pass a single child component or text.`

**Cause:** 
In Clerk v7 (or strictly typed Next.js App Router integrations), nesting standard `<button>` elements beneath a `<SignInButton>` triggers DOM hydration/nesting errors because the component generates its own interactive element. Additionally, props like `forceRedirectUrl` may cause unpredictable rendering inside strict button tree chains.

**Fix:** 
Avoid `<SignInButton>` entirely when creating custom UI buttons. Instead, use a plain Next.js `<Link>` pointing to a protected dashboard route and let Clerk's middleware handle the unauthenticated redirect dynamically.
```tsx
// ❌ Error-prone in Clerk v7 custom wrappers
<SignInButton mode="modal">
  <button className="primaryButton">Log In</button>
</SignInButton>

// ✅ Robust Fix (Relies on Middleware)
<Link href="/dashboard" className="primaryButton">
  Log In
</Link>
```
