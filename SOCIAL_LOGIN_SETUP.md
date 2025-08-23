# Social Login Setup Guide

Your workout app now supports social login with Google and GitHub. To enable these features, you need to configure OAuth providers in your Supabase project.

## Prerequisites
- A Supabase project with authentication enabled
- Valid Supabase URL and anon key set in your environment variables

## Setup Steps

### 1. Configure OAuth Providers in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project
3. Go to **Authentication** > **Providers**

### 2. Google OAuth Setup

1. In Supabase, find **Google** in the providers list
2. Enable Google and configure:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
   - **Redirect URL**: `https://[your-project-id].supabase.co/auth/v1/callback`

#### Google Cloud Console Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `https://[your-project-id].supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret to Supabase

### 3. GitHub OAuth Setup

1. In Supabase, find **GitHub** in the providers list
2. Enable GitHub and configure:
   - **Client ID**: From GitHub OAuth App
   - **Client Secret**: From GitHub OAuth App
   - **Redirect URL**: `https://[your-project-id].supabase.co/auth/v1/callback`

#### GitHub OAuth App Setup:
1. Go to GitHub **Settings** > **Developer settings** > **OAuth Apps**
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Your app name
   - **Homepage URL**: Your app URL
   - **Authorization callback URL**: `https://[your-project-id].supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

## Environment Variables

Make sure your `.env` file includes:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing

1. Start your app: `npm start`
2. Try logging in with Google or GitHub
3. Users should be redirected to the provider's login page
4. After authorization, they'll be redirected back to your app

## Troubleshooting

- Ensure redirect URLs match exactly in both provider and Supabase
- Check that OAuth apps are not in development mode (for production)
- Verify that your Supabase project has authentication enabled
- Make sure environment variables are properly set

## Additional Providers

To add more providers (Facebook, Twitter, etc.):
1. Add new buttons to the `Auth.jsx` component
2. Configure the provider in Supabase
3. Use the same `handleSocialLogin` function with the provider name

Example for Facebook:
```jsx
<button onClick={() => handleSocialLogin('facebook')}>
  Sign in with Facebook
</button>
```