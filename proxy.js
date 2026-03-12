const express = require('express');
const cors = require('cors');
require('dotenv').config();



const app = express();
app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
  try {
    const { symptoms, vitalsText, notes, profileText } = req.body;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{
          role: 'user',
          content: `You are a medical AI assistant. Analyze the following patient data and provide a health risk assessment.

Patient Profile: ${profileText || 'Not provided'}
Patient Symptoms: ${symptoms}
Additional Notes: ${notes || 'None'}
Vitals from IoT sensors: ${vitalsText}

Respond ONLY with a JSON object (no markdown, no backticks):
{
  "severity": "normal or mild or moderate or severe",
  "riskLevel": "Low or Medium or High",
  "diagnosis": "2-3 sentence plain English diagnosis",
  "action": "specific recommended action for the patient"
}`,
        }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('Groq error:', data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.choices[0].message.content;
    console.log('Extracted text:', text);

    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    console.error('Proxy catch error:', err);
    res.status(500).json({ error: 'Proxy error' });
  }
});

app.listen(3001, () => console.log('Proxy running on port 3001'));