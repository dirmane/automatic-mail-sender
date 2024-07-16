import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import styled from "styled-components";
import "./App.css";
import Footer from "./Footer";

const socket = io("http://localhost:3000", { transports: ["websocket"] });

const Container = styled.div`
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, Helvetica, sans-serif;
`;

const FormContainer = styled.div`
  flex: 1;
  padding: 20px;
  border-right: 1px solid #ccc;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const TextArea = styled.textarea`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const RightContainer = styled.div`
  flex: 1;
  padding: 20px;
`;

const Logs = styled.div`
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  max-height: 500px;
  overflow-y: auto;
`;

const ProgressBarContainer = styled.div`
  margin-bottom: 20px;
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 5px;
`;

const ProgressBar = styled.div`
  height: 30px;
  width: ${(props) => props.width}%;
  background-color: #007bff;
  border-radius: 5px;
  text-align: center;
  color: #fff;
  line-height: 30px;
`;

function App() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachmentPath, setAttachmentPath] = useState("");
  const [emails, setEmails] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState({ total: 0, sent: 0 });

  useEffect(() => {
    // Fetch current settings from the server
    const fetchSettings = async () => {
      try {
        const response = await axios.get("/settings");
        setSubject(response.data.subject);
        setBody(response.data.body);
        setAttachmentPath(response.data.attachmentPath);
        setEmails(response.data.emails.join(", "));
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();

    socket.on("log", (message) => {
      setLogs((prevLogs) => [...prevLogs, message]);
    });

    socket.on("progress", (data) => {
      setProgress(data);
    });

    return () => {
      socket.off("log");
      socket.off("progress");
    };
  }, []);

  const updateSettings = async () => {
    try {
      const emailList = emails.split(",").map((email) => email.trim());

      await axios.post("/update-emails", { emails: emailList });
      await axios.post("/update-content", { subject, body, attachmentPath });

      console.log("Settings updated");
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const sendEmails = async () => {
    try {
      await axios.post("/send-emails");
      console.log("Started sending emails");
    } catch (error) {
      console.error("Error sending emails:", error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setAttachmentPath(response.data.filePath);
      console.log("File uploaded successfully:", response.data.filePath);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <Container>
      <FormContainer>
        <Title>Email Sender Control Panel</Title>
        <Form>
          <Label htmlFor="subject">Subject:</Label>
          <Input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <Label htmlFor="body">Body:</Label>
          <TextArea
            id="body"
            rows="4"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          ></TextArea>

          <Label htmlFor="attachment">Attachment Path:</Label>
          <Input
            type="text"
            id="attachment"
            value={attachmentPath}
            onChange={(e) => setAttachmentPath(e.target.value)}
          />

          <Label htmlFor="fileUpload">Upload Attachment:</Label>
          <Input type="file" id="fileUpload" onChange={handleFileChange} />
          <Button type="button" onClick={handleFileUpload}>
            Upload File
          </Button>

          <Label htmlFor="emails">Email Addresses (comma-separated):</Label>
          <TextArea
            id="emails"
            rows="4"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            required
          ></TextArea>

          <Button type="button" onClick={updateSettings}>
            Update Settings
          </Button>
          <Button type="button" onClick={sendEmails}>
            Send Emails
          </Button>
        </Form>
      </FormContainer>

      <RightContainer>
        <h2>Email Progress</h2>
        <ProgressBarContainer>
          <ProgressBar width={(progress.sent / progress.total) * 100}>
            {((progress.sent / progress.total) * 100).toFixed(2)}%
          </ProgressBar>
        </ProgressBarContainer>

        <h2>Logs</h2>
        <Logs>
          {logs.map((log, index) => (
            <p key={index}>{log}</p>
          ))}
        </Logs>
      </RightContainer>
      <Footer />
    </Container>
  );
}

export default App;
