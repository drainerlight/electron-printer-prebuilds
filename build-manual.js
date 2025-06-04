const { execSync } = require('child_process');
const fs = require('fs');

// Get platform from command line argument
const platform = process.argv[2];
if (!platform || !['linux', 'win'].includes(platform)) {
  console.error('Usage: node build-manual.js <linux|win>');
  process.exit(1);
}

// Get Electron version from command line or prompt
const electronVersion = process.argv[3] || process.env.ELECTRON_VERSION;
if (!electronVersion) {
  console.error('Please specify Electron version:');
  console.error('Usage: node build-manual.js <platform> <version>');
  console.error('Example: node build-manual.js linux 30.0.0');
  console.error('Or set ELECTRON_VERSION environment variable');
  process.exit(1);
}

console.log(`Building for Electron v${electronVersion} on ${platform}...`);

// Update package.json devDependency
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.devDependencies.electron = electronVersion;
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

// Install the specific Electron version
console.log(`Installing Electron v${electronVersion}...`);
execSync('yarn install', { stdio: 'inherit' });

// Build for the specified platform
try {
  const targetPlatform = platform === 'win' ? 'win32' : 'linux';
  const arch = 'x64'; // Default to x64, can be made configurable later
  
  const env = { 
    ...process.env, 
    ELECTRON_VERSION: electronVersion,
    npm_config_target: electronVersion,
    npm_config_runtime: 'electron',
    npm_config_target_platform: targetPlatform,
    npm_config_arch: arch,
    npm_config_dist_url: 'https://electronjs.org/headers',
    npm_config_cache: '/tmp/.npm'
  };
  
  // Clean previous builds
  console.log('Cleaning previous builds...');
  try {
    execSync('node-pre-gyp clean', { stdio: 'inherit', env });
  } catch (e) {
    console.log('No previous build to clean');
  }
  
  // Configure
  console.log('Configuring build...');
  execSync(`node-pre-gyp configure --target_platform=${targetPlatform} --runtime=electron --dist-url=https://electronjs.org/headers --target=${electronVersion} --arch=${arch}`, { 
    stdio: 'inherit',
    env 
  });
  
  // Build
  console.log('Building...');
  execSync(`node-pre-gyp build --target_platform=${targetPlatform} --runtime=electron --dist-url=https://electronjs.org/headers --target=${electronVersion} --arch=${arch}`, { 
    stdio: 'inherit',
    env 
  });
  
  // Package
  console.log('Packaging...');
  execSync('node-pre-gyp package', { 
    stdio: 'inherit',
    env 
  });
  
  console.log(`✓ Successfully built for ${platform}`);
} catch (error) {
  console.error(`✗ Failed to build for ${platform}:`, error.message);
  console.error('Make sure you have:');
  console.error('1. Python installed');
  console.error('2. Build tools installed (build-essential on Linux, Visual Studio on Windows)');
  console.error('3. Source files (binding.gyp, src/ directory) present');
  process.exit(1);
}
