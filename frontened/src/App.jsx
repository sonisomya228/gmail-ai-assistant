import { useState } from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";

function App() {
  // =========================================================
  // STATES
  // =========================================================

  const [emailContent, setEmailContent] = useState("");

  const [tone, setTone] = useState("Casual");

  const [generatedResponse, setGeneratedResponse] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  // =========================================================
  // GENERATE EMAIL REPLY
  // =========================================================

  const handleGenerateReply = async () => {
    // Remove previous result and error
    setError("");
    setGeneratedResponse("");

    // Validate input
    if (!emailContent.trim()) {
      setError("Please enter the original email content.");
      return;
    }

    setLoading(true);

    try {
      // -------------------------------------------------------
      // Send request to Spring Boot
      // -------------------------------------------------------

      const response = await fetch(
        "http://localhost:8080/api/email/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailContent: emailContent,
            tone: tone,
          }),
        }
      );

      // -------------------------------------------------------
      // IMPORTANT:
      // Backend returns plain text, so use response.text()
      // instead of response.json()
      // -------------------------------------------------------

      const responseText = await response.text();

      console.log("HTTP Status:", response.status);
      console.log(
        "Content-Type:",
        response.headers.get("content-type")
      );
      console.log("Backend Response:", responseText);

      // -------------------------------------------------------
      // Handle HTTP errors
      // -------------------------------------------------------

      if (!response.ok) {
        throw new Error(
          responseText ||
            `Server returned HTTP ${response.status}`
        );
      }

      // -------------------------------------------------------
      // Handle empty response
      // -------------------------------------------------------

      if (!responseText.trim()) {
        throw new Error(
          "The server returned an empty response."
        );
      }

      // -------------------------------------------------------
      // SUCCESS
      // -------------------------------------------------------

      setGeneratedResponse(responseText);
      setError("");
    } catch (err) {
      console.error("Generate Reply Error:", err);

      // Make sure response isn't displayed with error
      setGeneratedResponse("");

      // Display error
      setError(
        err.message ||
          "Unable to generate the reply. Please check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // COPY GENERATED RESPONSE
  // =========================================================

  const handleCopy = async () => {
    if (!generatedResponse) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedResponse
      );

      setCopied(true);
    } catch (err) {
      console.error("Copy failed:", err);

      setError("Unable to copy the generated reply.");
    }
  };

  // =========================================================
  // CLEAR EVERYTHING
  // =========================================================

  const handleClear = () => {
    setEmailContent("");
    setTone("Casual");
    setGeneratedResponse("");
    setError("");
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f4f7ff 0%, #eef2ff 50%, #f8fafc 100%)",
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <AppBar
        position="static"
        elevation={0}
        sx={{
          background:
            "linear-gradient(90deg, #1565c0 0%, #1976d2 50%, #5e35b1 100%)",
        }}
      >
        <Toolbar sx={{ py: 1.2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              backgroundColor:
                "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 1.5,
              fontSize: 24,
            }}
          >
            ✉
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ lineHeight: 1.2 }}
            >
              AI Email Assistant
            </Typography>

            <Typography
              variant="caption"
              sx={{ opacity: 0.85 }}
            >
              Generate intelligent email replies instantly
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <Container
        maxWidth="md"
        sx={{
          py: {
            xs: 4,
            md: 7,
          },
        }}
      >
        {/* ===================================================
            PAGE HEADING
        ==================================================== */}

        <Box
          sx={{
            textAlign: "center",
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, #1976d2, #7c4dff)",
              color: "white",
              mb: 2,
              fontSize: 30,
              boxShadow:
                "0 12px 30px rgba(25,118,210,0.25)",
            }}
          >
            ✨
          </Box>

          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              fontSize: {
                xs: "2rem",
                md: "2.8rem",
              },
              background:
                "linear-gradient(90deg, #1565c0, #7c4dff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Email Reply Generator
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 1,
              maxWidth: 650,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            Paste an email, select your preferred tone,
            and let AI create a thoughtful reply for you.
          </Typography>
        </Box>

        {/* ===================================================
            INPUT CARD
        ==================================================== */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2.5,
              md: 4,
            },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "rgba(0,0,0,0.08)",
            boxShadow:
              "0 18px 50px rgba(31,38,135,0.09)",
            backgroundColor:
              "rgba(255,255,255,0.96)",
          }}
        >
          {/* Email Label */}

          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ mb: 1 }}
          >
            Original Email
          </Typography>

          {/* Email Text Area */}

          <TextField
            fullWidth
            multiline
            minRows={7}
            maxRows={14}
            placeholder="Paste the email you received here..."
            value={emailContent}
            onChange={(event) =>
              setEmailContent(event.target.value)
            }
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "#fafbff",

                "&:hover fieldset": {
                  borderColor: "#1976d2",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2",
                  borderWidth: 2,
                },
              },
            }}
          />

          {/* Character Counter */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 1,
              mb: 3,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Enter the complete email for better results.
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {emailContent.length} characters
            </Typography>
          </Box>

          {/* =================================================
              CONTROLS
          ================================================== */}

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              alignItems: {
                xs: "stretch",
                sm: "flex-end",
              },
            }}
          >
            {/* Tone */}

            <FormControl
              fullWidth
              sx={{
                flex: 1,
              }}
            >
              <InputLabel id="tone-label">
                Reply Tone
              </InputLabel>

              <Select
                labelId="tone-label"
                value={tone}
                label="Reply Tone"
                onChange={(event) =>
                  setTone(event.target.value)
                }
                sx={{
                  borderRadius: 3,
                }}
              >
                <MenuItem value="Casual">
                  Casual
                </MenuItem>

                <MenuItem value="Professional">
                  Professional
                </MenuItem>

                <MenuItem value="Friendly">
                  Friendly
                </MenuItem>

                <MenuItem value="Formal">
                  Formal
                </MenuItem>

                <MenuItem value="Apologetic">
                  Apologetic
                </MenuItem>

                <MenuItem value="Appreciative">
                  Appreciative
                </MenuItem>
              </Select>
            </FormControl>

            {/* Clear */}

            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={loading}
              sx={{
                minHeight: 56,
                borderRadius: 3,
                px: 3,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Clear
            </Button>

            {/* Generate */}

            <Button
              variant="contained"
              onClick={handleGenerateReply}
              disabled={loading}
              sx={{
                minHeight: 56,
                px: 4,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",

                background:
                  "linear-gradient(90deg, #1976d2, #5e35b1)",

                boxShadow:
                  "0 8px 20px rgba(25,118,210,0.25)",

                "&:hover": {
                  background:
                    "linear-gradient(90deg, #1565c0, #4527a0)",

                  boxShadow:
                    "0 10px 25px rgba(25,118,210,0.35)",
                },
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CircularProgress
                    size={20}
                    color="inherit"
                  />

                  Generating...
                </Box>
              ) : (
                "Generate Reply"
              )}
            </Button>
          </Box>
        </Paper>

        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && !generatedResponse && (
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid #ef5350",
              backgroundColor: "#fff5f5",
              boxShadow:
                "0 10px 30px rgba(211,47,47,0.12)",
            }}
          >
            <Box
              sx={{
                px: {
                  xs: 2.5,
                  md: 3,
                },
                py: 2,
                backgroundColor: "#ffebee",
                borderBottom:
                  "1px solid #ffcdd2",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                color="error.main"
              >
                ⚠ Unable to Generate Reply
              </Typography>
            </Box>

            <Box
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },
              }}
            >
              <Typography
                variant="body1"
                color="error.dark"
                sx={{
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                }}
              >
                {error}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* ===================================================
            GENERATED RESPONSE
        ==================================================== */}

        {generatedResponse && !error && (
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid",
              borderColor:
                "rgba(25,118,210,0.2)",
              boxShadow:
                "0 15px 45px rgba(31,38,135,0.08)",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Response Header */}

            <Box
              sx={{
                px: {
                  xs: 2.5,
                  md: 3,
                },
                py: 2,

                display: "flex",

                justifyContent:
                  "space-between",

                alignItems: "center",

                background:
                  "linear-gradient(90deg, #f5f9ff, #f8f5ff)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  ✨ Generated Reply
                </Typography>

                <Chip
                  label={tone}
                  size="small"
                  sx={{
                    ml: 1,
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={handleCopy}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Copy
              </Button>
            </Box>

            <Divider />

            {/* Generated Text */}

            <Box
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },
                minHeight: 180,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.8,
                  color: "#263238",
                }}
              >
                {generatedResponse}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 4,
          }}
        >
          Powered by AI • Generate better replies in seconds
        </Typography>
      </Container>

      {/* =====================================================
          COPY SUCCESS MESSAGE
      ====================================================== */}

      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setCopied(false)}
        >
          Reply copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;