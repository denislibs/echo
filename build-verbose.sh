#!/bin/bash

# Verbose build script that shows all errors
echo "🚀 Building Arc.js Framework packages (verbose mode)..."
echo ""

packages=("reactivity" "utils" "compiler" "core" "router")
failed_packages=()

for package in "${packages[@]}"; do
    echo "📦 Building @arc.js/$package..."
    
    if cd "packages/$package" && npm run build; then
        echo "✅ @arc.js/$package built successfully"
        cd - > /dev/null
    else
        echo "❌ Failed to build @arc.js/$package"
        failed_packages+=("$package")
        cd - > /dev/null
    fi
    echo ""
done

if [ ${#failed_packages[@]} -eq 0 ]; then
    echo "🎉 All packages built successfully!"
    exit 0
else
    echo "❌ Failed to build packages: ${failed_packages[*]}"
    exit 1
fi
