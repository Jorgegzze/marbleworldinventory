const fs = require('fs');
const archiver = require('archiver');

// Create output directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Create a writable stream for the ZIP file
const output = fs.createWriteStream('dist/squarespace-package.zip');
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('Package created successfully!');
});

// Handle archive warnings
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

// Handle archive errors
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add the build files to the archive
archive.file('dist/index.html', { name: 'index.html' });
archive.file('dist/bundle.js', { name: 'bundle.js' });

// Finalize the archive
archive.finalize();
