import React, { useState, useEffect, useRef } from "react";
import WebGazer from "webgazer";
import axios from "axios";

const App = () => {
  const [typedText, setTypedText] = useState(""); // The dynamically typed text
  const [selectedKey, setSelectedKey] = useState(null); // Currently highlighted key
  const gazeKey = useRef(null); // The key currently under gaze
  const gazeStartTime = useRef(null); // Start time for gaze tracking

  const GAZE_TIME_THRESHOLD = 1000; // Gaze time in ms to type a key

  // Virtual keyboard layout
  const keys = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M", "SPACE"],
  ];

  useEffect(() => {
    // Initialize WebGazer for gaze tracking
    WebGazer.setGazeListener((data) => {
      if (data) {
        const { x, y } = data; // Gaze coordinates
        const element = document.elementFromPoint(x, y); // Element under gaze

        if (element && element.dataset.key) {
          const key = element.dataset.key;

          if (gazeKey.current !== key) {
            // Update the gaze key and start tracking time
            gazeKey.current = key;
            gazeStartTime.current = new Date().getTime();
          } else {
            // Check if gaze time exceeds threshold
            const elapsedGazeTime = new Date().getTime() - gazeStartTime.current;
            if (elapsedGazeTime >= GAZE_TIME_THRESHOLD) {
              sendKeyToBackend(key); // Dynamically type the key
              gazeKey.current = null; // Reset gaze key after typing
            }
          }
          setSelectedKey(key); // Highlight the key being gazed at
        } else {
          setSelectedKey(null); // Clear highlight if gaze moves away
          gazeKey.current = null;
        }
      }
    }).begin();

    return () => {
      WebGazer.end(); // Clean up WebGazer on component unmount
    };
  }, []);

  // Send the gaze-detected key to the backend
  const sendKeyToBackend = async (key) => {
    try {
      const response = await axios.post("http://localhost:5000/api/keypress", { key });
      setTypedText((prev) => prev + response.data.key); // Append backend's response to the text
    } catch (error) {
      console.error("Error sending key to backend:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1 style={{ fontWeight: "bold", marginBottom: "20px" }}>Dynamic Eye-Tracking Virtual Keyboard</h1>

      {/* Webcam Feed */}
      <div style={{ width: "640px", margin: "0 auto", marginBottom: "20px" }}>
        <video
          autoPlay
          playsInline
          style={{
            width: "100%",
            height: "auto",
            border: "2px solid black",
          }}
        ></video>
      </div>

      {/* Text Area */}
      <textarea
        value={typedText}
        readOnly
        placeholder="Your typed text will appear here..."
        style={{
          width: "90%",
          height: "100px",
          fontSize: "18px",
          marginBottom: "20px",
          border: "2px solid black",
        }}
      />

      {/* Virtual Keyboard */}
      <div
        className="keyboard"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "0 auto",
          padding: "10px",
          border: "2px solid black",
          borderRadius: "10px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex", marginBottom: "10px" }}>
            {row.map((key) => (
              <button
                key={key}
                data-key={key}
                style={{
                  width: key === "SPACE" ? "150px" : "50px",
                  height: "50px",
                  margin: "5px",
                  fontSize: "16px",
                  borderRadius: "5px",
                  backgroundColor: selectedKey === key ? "yellow" : "white",
                  border: "1px solid #ccc",
                  cursor: "default",
                }}
              >
                {key === "SPACE" ? "Space" : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
