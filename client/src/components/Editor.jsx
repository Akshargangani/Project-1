// src/components/Editor.jsx
import { useState } from "react";

export default function Editor({ onChange }) {
  const [code, setCode] = useState(`#include <stdio.h>\nint main() {\n  printf("Hello World");\n  return 0;\n}`);

  const handleChange = (e) => {
    setCode(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  return (
    <textarea
      value={code}
      onChange={handleChange}
      style={{
        width: "100%",
        height: "300px",
        fontFamily: "monospace",
        fontSize: "14px",
        padding: "10px",
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
        borderRadius: "8px",
        outline: "none",
      }}
    />
  );
}
