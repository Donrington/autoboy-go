@echo off
echo Testing AutoBoy API on Render...
echo.

echo Testing health check...
curl -s -o nul -w "Health Check: %%{http_code} - %%{time_total}s\n" https://autoboy-go.onrender.com/health

echo.
echo Testing public endpoints...
curl -s -o nul -w "GET /api/v1/products: %%{http_code} - %%{time_total}s\n" https://autoboy-go.onrender.com/api/v1/products
curl -s -o nul -w "GET /api/v1/categories: %%{http_code} - %%{time_total}s\n" https://autoboy-go.onrender.com/api/v1/categories
curl -s -o nul -w "GET /api/v1/search: %%{http_code} - %%{time_total}s\n" "https://autoboy-go.onrender.com/api/v1/search?q=phone"

echo.
echo Testing authentication...
curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"admin@autoboy.ng\",\"password\":\"Admin123!\"}" -o nul -w "POST /api/v1/auth/login: %%{http_code} - %%{time_total}s\n" https://autoboy-go.onrender.com/api/v1/auth/login

echo.
echo Testing CORS headers...
curl -s -X OPTIONS -H "Origin: https://autoboy.vercel.app" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type, Authorization" -I https://autoboy-go.onrender.com/api/v1/products

echo.
echo Render deployment test completed!
pause