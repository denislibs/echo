#!/bin/bash

# Build script for Arc.js Framework packages
# Builds packages in dependency order and shows detailed output

set -e  # Exit on any error

echo "🚀 Building Arc.js Framework packages..."
echo ""

# Function to build a package with error handling
build_package() {
    local package_name=$1
    local package_path="./packages/$package_name"
    
    echo "📦 Building @arc.js/$package_name..."
    
    if [ ! -d "$package_path" ]; then
        echo "❌ Package directory $package_path not found"
        exit 1
    fi
    
    cd "$package_path"
    
    if npm run build; then
        echo "✅ @arc.js/$package_name built successfully"
    else
        echo "❌ Failed to build @arc.js/$package_name"
        exit 1
    fi
    
    cd - > /dev/null
    echo ""
}

# Build packages in dependency order
build_package "reactivity"
build_package "utils" 
build_package "compiler"
build_package "core"
build_package "router"

echo "🎉 All packages built successfully!"
