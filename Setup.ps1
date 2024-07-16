# Step 3: Run the setup script
Write-Host "Running setup script..."
npm install
node setup.js

# Step 4: Install backend dependencies
Write-Host "Installing backend dependencies..."
cd backend
npm install

# Step 5: Install frontend dependencies
Write-Host "Installing frontend dependencies..."
cd ../automail
npm install

# Step 6: Start the backend and frontend
Write-Host "Starting backend and frontend..."
cd ..
start cmd /c "cd backend && npm start"
start cmd /c "cd automail && npm start"

Write-Host "Setup complete. The backend and frontend are running."
