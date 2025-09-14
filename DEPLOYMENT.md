# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.production` to `.env.production.local`
- [ ] Update `NEXT_PUBLIC_FRONTEND_URL` to your production domain
- [ ] Verify all Supabase credentials are correct
- [ ] Set `NEXT_PUBLIC_ENABLE_DEBUG_PAGES=false`
- [ ] Set `NEXT_PUBLIC_ENABLE_ANALYTICS=true`

### 2. Supabase Configuration
- [ ] Add production domain to Supabase Auth redirect URLs:
  - `https://your-domain.com/auth/callback`
  - `https://your-domain.com/auth/verify`
- [ ] Verify RLS policies are enabled on all tables
- [ ] Test database connection from production environment

### 3. Code Quality
- [ ] Remove all `console.log` statements from production code
- [ ] Run `npm run build` locally to verify build succeeds
- [ ] Run `npm run lint` to check for linting errors
- [ ] Verify all TypeScript errors are resolved

### 4. Performance Optimization
- [ ] Images are optimized and using Next.js Image component
- [ ] Unused dependencies removed from package.json
- [ ] Bundle size is acceptable (check with `npm run build`)

## Deployment Steps

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # If not already connected
   npx vercel
   # Follow prompts to connect your GitHub repository
   ```

2. **Configure Environment Variables**
   ```bash
   # Set environment variables in Vercel dashboard
   # Or use Vercel CLI:
   npx vercel env add NEXT_PUBLIC_SUPABASE_URL
   npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   npx vercel env add SUPABASE_SERVICE_ROLE_KEY
   npx vercel env add NEXT_PUBLIC_FRONTEND_URL
   ```

3. **Deploy**
   ```bash
   # Deploy to production
   npx vercel --prod
   ```

### Alternative: Manual Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Test Production Build Locally**
   ```bash
   npm start
   ```

3. **Deploy Build Files**
   - Upload `.next` folder and required files to your hosting provider
   - Ensure Node.js runtime is available
   - Configure environment variables on your hosting platform

## Post-Deployment Verification

### 1. Functionality Tests
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads correctly
- [ ] Todo creation/editing works
- [ ] Real-time updates function
- [ ] PWA installation works (if enabled)

### 2. Performance Tests
- [ ] Page load times are acceptable (< 3 seconds)
- [ ] Mobile responsiveness works
- [ ] Auth redirects function properly
- [ ] Error boundaries catch and display errors gracefully

### 3. Security Tests
- [ ] Debug pages are not accessible in production
- [ ] Sensitive data is not exposed in client-side code
- [ ] Auth middleware protects dashboard routes
- [ ] RLS policies prevent unauthorized data access

## Monitoring and Maintenance

### 1. Error Monitoring
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor Vercel function logs
- Set up Supabase monitoring alerts

### 2. Performance Monitoring
- Monitor Core Web Vitals
- Set up uptime monitoring
- Track user engagement metrics

### 3. Security Monitoring
- Monitor Supabase auth logs
- Set up alerts for failed login attempts
- Review and update dependencies regularly

## Rollback Plan

### If Deployment Fails:
1. Revert to previous Vercel deployment:
   ```bash
   npx vercel rollback
   ```

2. Check Vercel logs:
   ```bash
   npx vercel logs
   ```

3. Fix issues locally and redeploy:
   ```bash
   npx vercel --prod
   ```

### If Database Issues Occur:
1. Check Supabase dashboard for errors
2. Verify RLS policies haven't broken
3. Restore from Supabase backup if necessary

## Support Contacts

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Development Team**: [Add your contact information]
