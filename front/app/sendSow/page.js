"use client";
import { useState } from 'react';

export default function Sow() {
  const [sowText, setSowText] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/send-sow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sowText }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      alert(`SOW Submitted Successfully: ${JSON.stringify(result)}`);
      setSowText('');
    } catch (error) {
      alert('Failed to submit SOW: ' + error.message);
    }
  };

  return (
    <div>
      <h1>Submit Statement of Work (SOW)</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={sowText}
          onChange={(e) => setSowText(e.target.value)}
          placeholder="Paste your SOW here"
          rows="10"
          cols="50"
        />
        <br />
        <button type="submit">Submit SOW</button>
      </form>
    </div>
  );
}