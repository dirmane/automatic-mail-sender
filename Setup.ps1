# Step 3: Run the setup script
Write-Host "Running setup script..."
npm install
cls
node setup.js
cls

# Step 4: Install backend dependencies
Write-Host "Installing backend dependencies..."
cd backend
npm install
cls

# Step 5: Install frontend dependencies
Write-Host "Installing frontend dependencies..."
cd ../automail
npm install
cls

# Step 6: Start the backend and frontend
Write-Host "Starting backend and frontend..."
cd ..
start powershell {cd backend; npm start}
start powershell {cd automail; npm start}
Write-Host "Setup complete. The backend and frontend are running."
