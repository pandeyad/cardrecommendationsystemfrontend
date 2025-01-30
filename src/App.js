import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, Box, Paper, Typography, CircularProgress, IconButton } from '@mui/material';
import { Stack } from '@mui/system';
import Skeleton from '@mui/material/Skeleton';
import UploadFileIcon from '@mui/icons-material/UploadFile';

function App() {
    const [userInput, setUserInput] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatContainerRef = useRef(null);
    const [fileUpload, setFileUpload] = useState(false);

    const parseMessage = (message) => {
        const thinkPattern = /<think>(.*?)<\/think>/s;
        const match = message.match(thinkPattern);

        let thoughtProcess = '';
        let conclusion = message;

        if (match) {
            thoughtProcess = match[1].trim();
            conclusion = message.replace(match[0], '').trim(); // Remove the thought process part
        }
        return { thoughtProcess, conclusion };
    };

    // Send Message
    const sendMessage = async () => {
        if (!userInput.trim()) return;

        const newChatHistory = [...chatHistory, { sender: 'user', message: userInput }];
        setChatHistory(newChatHistory);
        setUserInput("");
        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: userInput }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const res = parseMessage(data)
            setChatHistory([...newChatHistory, { sender: 'server', message: res.conclusion }]);
        } catch (error) {
            console.error("Error fetching response:", error);
            alert("Error connecting to chatbot API.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (!file) return;
        if (file.type !== "text/csv") {
            alert("Please upload a valid CSV file.");
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            setFileUpload(true);
            const text = e.target.result;
            const rows = text.split("\n").map(row => row.trim()).filter(row => row.length > 0);

            if (rows.length === 0) {
                alert("The CSV file is empty.");
                return;
            }

            // Format CSV data into a readable format
            let formattedData = "Below are my spending habits:\n\n";
            rows.forEach((row, index) => {
                formattedData += `${row}\n`;  // Adds bullet points for better readability
            });

            formattedData += `\nPlease suggest me a good credit card that I can use for more benefits.`;

            setUserInput(formattedData);
        };

        reader.readAsText(file);
        setFileUpload(false);
    };

    // Auto-scroll to the latest message
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, loading]);

    return (
        <Box sx={{
            height: "100vh",  // Full screen height
            width: "100vw",   // Full screen width
            display: "flex",
            flexDirection: "column",
            bgcolor: "#f0f0f0",
            p: 0,             // No padding around the app
            overflow: "hidden",  // Prevent overflow issues
        }}>
            <Paper sx={{
                flexGrow: 1,  // Makes this container take all available space
                display: "flex",
                flexDirection: "column",
                borderRadius: "0px",
                boxShadow: "none",
            }}>
                {/* Header */}
                <Paper sx={{
                    p: 2,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: "bold",
                    bgcolor: "#d6d6d6",
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                }}>
                    Credit Card Recommendation System
                </Paper>

                {/* Chat Container */}
                <Box
                    ref={chatContainerRef}
                    sx={{
                        flexGrow: 1,
                        overflowY: "auto",
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Stack spacing={2}>
                        {chatHistory.map((msg, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    justifyContent: msg.sender === 'user' ? "flex-end" : "flex-start"
                                }}
                            >
                                <Typography
                                    sx={{
                                        bgcolor: msg.sender === 'user' ? "#4a90e2" : "#8e8e8e",
                                        color: "white",
                                        p: 2,
                                        borderRadius: "12px",
                                        maxWidth: "60%",
                                        boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
                                        wordWrap: "break-word"
                                    }}
                                >
                                    {msg.message}
                                </Typography>
                            </Box>
                        ))}

                        {/* Skeleton Loader for Bot Response */}
                        {loading && (
                            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                                <Box
                                    sx={{
                                        bgcolor: "#8e8e8e",
                                        color: "white",
                                        p: 2,
                                        borderRadius: "12px",
                                        maxWidth: "60%",
                                        boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1
                                    }}
                                >
                                    <Skeleton variant="text" width={100} height={20} />
                                    <CircularProgress size={18} sx={{ color: "white" }} />
                                </Box>
                            </Box>
                        )}
                    </Stack>
                </Box>

                {/* Input Box */}
                <Paper sx={{
                    p: 2,
                    display: "flex",
                    gap: 1,
                    bgcolor: "#d6d6d6",
                    borderBottomLeftRadius: "12px",
                    borderBottomRightRadius: "12px",
                    position: "relative",
                }}>

                    {/* Upload CSV Button */}
                    <Button
                        component="label"
                        sx={{
                            width: "48px",
                            height: "48px",
                            bgcolor: "#8e8e8e",
                            color: "white",
                            "&:hover": { bgcolor: "#757575" },
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <UploadFileIcon />
                        <input
                            type="file"
                            accept=".csv"
                            hidden
                            onChange={handleFileUpload}
                        />
                    </Button>

                    {/* Text Input */}
                    <TextField
                        fullWidth
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder='Type a message...'
                        disabled={loading}
                        multiline
                        sx={{
                            bgcolor: "white",
                            borderRadius: "8px",
                            input: { color: "#333" }
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />

                    {/* Send Button */}
                    <Button
                        variant="contained"
                        onClick={sendMessage}
                        disabled={loading}
                        sx={{
                            width: "48px",
                            height: "48px",
                            bgcolor: "#8e8e8e",
                            "&:hover": { bgcolor: "#757575" }
                        }}
                    >
                        Send
                    </Button>
                </Paper>
            </Paper>
        </Box>
    );
}

export default App;
