# setup.ps1

# Step 1: Clone the repository
git https://github.com/dirmane/automatic-mail-sender.git
cd email-automation

# Step 2: Install Node.js if not already installed
$nodeInstalled = node -v
if (!$nodeInstalled) {
    Write-Host "Node.js is not installed. Installing Node.js..."
    choco install nodejs -y
}

# Step 3: Run the setup script
Write-Host "Running setup script..."
node setup.js

# Step 4: Install backend dependencies
Write-Host "Installing backend dependencies..."
cd backend
npm install

# Step 5: Install frontend dependencies
Write-Host "Installing frontend dependencies..."
cd ../frontend
npm install

# Step 6: Start the backend and frontend
Write-Host "Starting backend and frontend..."
cd ..
start cmd /c "cd backend && npm start"
start cmd /c "cd frontend && npm start"

Write-Host "Setup complete. The backend and frontend are running."
