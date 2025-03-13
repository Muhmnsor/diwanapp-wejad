
#!/bin/bash

# Create fonts directory if it doesn't exist
mkdir -p public/fonts

# Download Amiri Regular
if [ ! -f public/fonts/Amiri-Regular.ttf ]; then
  echo "Downloading Amiri-Regular.ttf..."
  curl -L https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Regular.ttf -o public/fonts/Amiri-Regular.ttf
fi

# Download Amiri Bold
if [ ! -f public/fonts/Amiri-Bold.ttf ]; then
  echo "Downloading Amiri-Bold.ttf..."
  curl -L https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Bold.ttf -o public/fonts/Amiri-Bold.ttf
fi

echo "Font setup complete!"
