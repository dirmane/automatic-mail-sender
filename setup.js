// setup.js
const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const questions = [
  "Enter your sender email: ",
  "Enter your sender email password: ",
];

const envVars = {};

const askQuestion = (index) => {
  if (index >= questions.length) {
    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
    fs.writeFileSync("backend/.env", envContent);
    console.log(".env file created successfully.");
    rl.close();
    return;
  }

  rl.question(questions[index], (answer) => {
    switch (index) {
      case 0:
        envVars.SENDER_EMAIL = answer;
        break;
      case 1:
        envVars.SENDER_PASSWORD = answer;
        break;
    }
    askQuestion(index + 1);
  });
};

askQuestion(0);
