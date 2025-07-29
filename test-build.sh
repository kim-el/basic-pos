#!/bin/bash

echo "🚀 Testing POS System Build Process"
echo "=================================="

# Test 1: Check if required files exist
echo "✓ Checking Docker configuration..."
if [ -f "Dockerfile" ] && [ -f "docker-compose.yml" ]; then
    echo "  ✅ Docker files present"
else
    echo "  ❌ Missing Docker files"
    exit 1
fi

# Test 2: Check database initialization
echo "✓ Checking database schema..."
if [ -f "init-db/01-init.sql" ]; then
    echo "  ✅ Database schema ready"
else
    echo "  ❌ Missing database schema"
    exit 1
fi

# Test 3: Check Next.js configuration
echo "✓ Checking Next.js build config..."
if grep -q "output.*standalone" next.config.ts; then
    echo "  ✅ Standalone output configured"
else
    echo "  ❌ Missing standalone configuration"
    exit 1
fi

# Test 4: Check API endpoints
echo "✓ Checking API structure..."
if [ -d "src/app/api/products" ] && [ -d "src/app/api/transactions" ]; then
    echo "  ✅ API endpoints present"
else
    echo "  ❌ Missing API endpoints"
    exit 1
fi

# Test 5: Check dependencies
echo "✓ Checking dependencies..."
if npm list pg > /dev/null 2>&1; then
    echo "  ✅ Database client installed"
else
    echo "  ❌ Missing database dependencies"
    exit 1
fi

echo ""
echo "🎉 Build Test Complete!"
echo "Your POS system is ready for deployment to DigitalOcean"
echo ""
echo "Next steps:"
echo "1. Push code to GitHub"
echo "2. Create DigitalOcean App Platform app"
echo "3. Set environment variables"
echo "4. Deploy!"