#!/bin/bash

# Deploy Supabase Edge Function: analytics-kpis
# Make sure you're logged in: supabase login
# Make sure your project is linked: supabase link --project-ref YOUR_PROJECT_REF

echo "🚀 Deploying analytics-kpis Edge Function..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Install it with: brew install supabase/tap/supabase"
    echo "Or: npm install -g supabase"
    exit 1
fi

# Deploy the function
supabase functions deploy analytics-kpis

echo ""
echo "✅ Deployment complete!"
echo ""
echo "To verify, check your Supabase dashboard:"
echo "https://supabase.com/dashboard/project/_/functions"


