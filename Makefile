# Define the directories
BACKEND_DIR := ./backend
FRONTEND_DIR := ./automail

# Define commands to install dependencies and start the backend and frontend
install-backend:
	cd $(BACKEND_DIR) && npm install

install-frontend:
	cd $(FRONTEND_DIR) && npm install

start-backend:
	cd $(BACKEND_DIR) && node server.js

start-frontend:
	cd $(FRONTEND_DIR) && npm start

# Define the command to install all dependencies
install: install-backend install-frontend

# Define the default command to start both
start:
	@echo "Starting Backend..."
	@$(MAKE) start-backend &
	@sleep 5
	@echo "Starting Frontend..."
	@$(MAKE) start-frontend
