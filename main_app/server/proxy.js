const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory registry for dynamic device detection
let registeredMACs = {
  '30:bb:7d:9c:b7:5a': { name: 'OnePlus Nord N20 SE', status: 'Ready' }
};

app.get('/bluetooth-stats', (req, res) => {
  res.json({
    activeBridges: 1,
    uptime: '99.9%',
    lastSync: new Date().toISOString()
  });
});

app.get('/bluetooth-config', (req, res) => {
  const dynamicDevices = Object.entries(registeredMACs).map(([id, info]) => ({
    id,
    name: info.name,
    type: 'phone',
    status: info.status,
    priority: 1
  }));

  res.json({
    primaryDevices: [
      { id: 'FC:21:44:66:88:99', name: 'ASHACARE', type: 'core', priority: 1 },
      ...dynamicDevices,
      { id: 'LP:33:AA:88:44:BB', name: 'mimidev', type: 'laptop', priority: 2 }
    ],
    autoSyncEnabled: true,
    handshakeProtocol: 'secure-v2'
  });
});

app.post('/register-mac', (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'ID and Name required' });
  
  registeredMACs[id] = { name, status: 'Detected', lastSeen: new Date() };
  console.log(`[AshaLink] New device registered: ${name} (${id})`);
  res.json({ success: true, message: `Device ${id} successfully written to backend registry.` });
});

// ============================================
// KNOWLEDGE BASE - Ayurvedic + Medical RAG
// ============================================
const knowledge = [
  {
    keywords: ['fever', 'temperature', 'hot body', 'burning body', 'mild fever'],
    risk: 'Low',
    ayurvedic: 'Drink tulsi ginger tea 3 times a day. Apply wet cloth on forehead. Drink warm water with honey. Eat light khichdi. Take complete rest.',
    medicine: 'Paracetamol 500mg if needed.'
  },
  {
    keywords: ['high fever', 'fever 103', 'fever 104', 'severe fever', 'dengue', 'typhoid', 'malaria'],
    risk: 'High',
    ayurvedic: null,
    medicine: 'Visit doctor immediately. Could be dengue, typhoid or serious infection. Do not delay.'
  },
  {
    keywords: ['cold', 'runny nose', 'sneezing', 'sore throat', 'blocked nose', 'nasal'],
    risk: 'Low',
    ayurvedic: 'Drink hot water with honey and ginger. Do steam inhalation with tulsi leaves. Gargle with warm salt water. Avoid cold drinks and ice cream.',
    medicine: 'Cetirizine 10mg for sneezing. Strepsils for throat.'
  },
  {
    keywords: ['cough', 'dry cough', 'mucus', 'phlegm', 'chest cough'],
    risk: 'Low',
    ayurvedic: 'Mix 1 tsp honey in warm water and drink. Chew raw ginger. Drink turmeric milk at night. Avoid dusty areas.',
    medicine: 'Benadryl or Ascoril syrup if needed.'
  },
  {
    keywords: ['headache', 'head pain', 'migraine', 'head ache', 'head hurts'],
    risk: 'Low',
    ayurvedic: 'Apply peppermint oil on temples. Rest in a dark quiet room. Drink water - dehydration causes headache. Take a short nap.',
    medicine: 'Paracetamol 500mg or Ibuprofen 400mg.'
  },
  {
    keywords: ['severe headache', 'worst headache', 'stiff neck', 'sudden headache', 'thunderclap headache'],
    risk: 'High',
    ayurvedic: null,
    medicine: 'Go to emergency immediately. Could be meningitis or brain bleed. Call 108 ambulance.'
  },
  {
    keywords: ['tired', 'fatigue', 'weakness', 'low energy', 'dark circles', 'sleepy', 'exhausted', 'no energy'],
    risk: 'Low',
    ayurvedic: 'Drink Ashwagandha milk at night. Sleep 7-8 hours daily. Eat iron rich foods like spinach, dates, jaggery. Reduce screen time before bed. Morning sunlight for 15 mins.',
    medicine: 'Multivitamin supplement daily.'
  },
  {
    keywords: ['stomach pain', 'acidity', 'bloating', 'indigestion', 'gas', 'stomach ache', 'acid reflux', 'heartburn'],
    risk: 'Low',
    ayurvedic: 'Drink jeera water or ajwain water. Eat small frequent meals. Avoid spicy oily food. Chew fennel seeds after meals. Drink warm water with lemon.',
    medicine: 'Eno or Pudin Hara for acidity. Digene syrup.'
  },
  {
    keywords: ['vomiting', 'loose motions', 'diarrhea', 'nausea'],
    risk: 'Medium',
    ayurvedic: 'Eat banana, rice, curd, and toast only. Drink coconut water. Ginger tea helps nausea.',
    medicine: 'ORS powder to stay hydrated. Ondansetron for vomiting. See doctor if continues more than 2 days.'
  },
  {
    keywords: ['blood stool', 'vomiting blood', 'black stool', 'bleeding'],
    risk: 'High',
    ayurvedic: null,
    medicine: 'Go to hospital immediately. Call 108 ambulance. This needs urgent medical attention.'
  },
  {
    keywords: ['chest pain', 'chest tightness', 'chest discomfort', 'heart pain'],
    risk: 'High',
    ayurvedic: null,
    medicine: 'Call 108 ambulance immediately. Could be heart attack. Chew aspirin 325mg if available. Sit upright. Do not drive yourself.'
  },
  {
    keywords: ['palpitation', 'heart racing', 'irregular heartbeat', 'heart pounding'],
    risk: 'High',
    ayurvedic: null,
    medicine: 'See a doctor immediately. Avoid caffeine and stress. Get ECG done. Do not ignore heart symptoms.'
  },
  {
    keywords: ['breathless', 'shortness of breath', 'wheezing', 'difficulty breathing', 'cant breathe'],
    risk: 'High',
    ayurvedic: null,
    medicine: 'Call 108 ambulance immediately. Sit upright. Use inhaler if prescribed. This is a medical emergency.'
  },
  {
    keywords: ['mild breathless', 'slight breathless', 'breathless on exertion'],
    risk: 'Medium',
    ayurvedic: 'Practice deep breathing exercises. Steam inhalation. Avoid dusty smoky areas.',
    medicine: 'Use inhaler if prescribed. See doctor if worsens.'
  },
  {
    keywords: ['rash', 'itching', 'skin allergy', 'hives', 'eczema', 'skin irritation'],
    risk: 'Low',
    ayurvedic: 'Apply coconut oil or aloe vera gel. Apply neem paste. Avoid scratching. Drink more water.',
    medicine: 'Cetirizine 10mg for itching. Calamine lotion for rash.'
  },
  {
    keywords: ['jaundice', 'yellow skin', 'yellow eyes', 'yellow urine'],
    risk: 'Medium',
    ayurvedic: 'Drink sugarcane juice. Eat papaya. Take complete rest. Avoid fatty oily food.',
    medicine: 'See a doctor. Get liver function test done immediately.'
  },
  {
    keywords: ['cant sleep', 'insomnia', 'sleep problem', 'restless sleep', 'sleeplessness'],
    risk: 'Low',
    ayurvedic: 'Drink warm turmeric milk before bed. Avoid phone and screens 1 hour before sleep. Try Brahmi or Ashwagandha supplement. Sleep at fixed time daily. Apply warm oil on feet.',
    medicine: null
  },
  {
    keywords: ['stress', 'anxiety', 'tension', 'overthinking', 'worry', 'panic', 'nervous'],
    risk: 'Low',
    ayurvedic: 'Practice deep breathing (Anulom Vilom) for 10 mins. Drink Brahmi tea. Try Ashwagandha supplement. Do light walk or yoga. Talk to someone you trust.',
    medicine: null
  },
  {
    keywords: ['back pain', 'back ache', 'lower back', 'spine pain'],
    risk: 'Low',
    ayurvedic: 'Apply warm sesame oil massage. Do gentle stretching. Avoid sitting for long hours. Sleep on firm mattress. Apply turmeric paste on painful area.',
    medicine: 'Ibuprofen 400mg or Diclofenac gel.'
  },
  {
    keywords: ['eye pain', 'red eyes', 'eye irritation', 'eye strain', 'watery eyes'],
    risk: 'Low',
    ayurvedic: 'Wash eyes with clean cold water. Apply rose water drops. Rest eyes from screens every 20 mins. Place cucumber slices on eyes.',
    medicine: 'Lubricating eye drops like Refresh or Tears Natural.'
  },
  {
    keywords: ['sugar', 'diabetes', 'excessive thirst', 'frequent urination', 'high blood sugar'],
    risk: 'Medium',
    ayurvedic: 'Drink bitter gourd (karela) juice in morning. Eat fenugreek seeds soaked in water. Reduce sugar and refined carbs. Exercise 30 mins daily.',
    medicine: 'Get blood sugar tested. Consult doctor for medication if needed.'
  },
  {
    keywords: ['dizzy', 'dizziness', 'vertigo', 'spinning', 'lightheaded'],
    risk: 'Medium',
    ayurvedic: 'Sit or lie down immediately. Drink warm water. Eat something light.',
    medicine: 'Check blood pressure. Take Stemetil if vertigo. See doctor if it repeats.'
  },
];

function searchKnowledge(symptoms, notes) {
  const query = ((symptoms || '') + ' ' + (notes || '')).toLowerCase();
  const matches = [];
  for (const entry of knowledge) {
    for (const keyword of entry.keywords) {
      if (query.includes(keyword.toLowerCase())) {
        matches.push(entry);
        break;
      }
    }
  }
  if (matches.length === 0) return null;
  const riskOrder = { High: 3, Medium: 2, Low: 1 };
  matches.sort((a, b) => (riskOrder[b.risk] || 0) - (riskOrder[a.risk] || 0));
  return matches[0];
}

// ============================================
// ANALYZE ENDPOINT
// ============================================
app.post('/analyze', async (req, res) => {
  try {
    const { symptoms, vitalsText, notes, profileText } = req.body;
    const ragResult = searchKnowledge(symptoms, notes);

    let ragContext = '';
    if (ragResult) {
      ragContext = `\nRelevant knowledge from medical database:
- Risk level: ${ragResult.risk}
${ragResult.ayurvedic ? `- Ayurvedic remedy: ${ragResult.ayurvedic}` : ''}
${ragResult.medicine ? `- Medical advice: ${ragResult.medicine}` : ''}
Use this knowledge to give specific accurate advice.\n`;
    }

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
          content: `You are a friendly AI health assistant. Analyze the patient data and give appropriate advice based on severity.

Patient Profile: ${profileText || 'Not provided'}
Patient Symptoms: ${symptoms}
Additional Notes: ${notes || 'None'}
Vitals from IoT sensors: ${vitalsText}
${ragContext}
IMPORTANT RULES:
- For LOW risk / mild symptoms: suggest home remedies and Ayurvedic tips. Do NOT say visit doctor.
- For MEDIUM risk: suggest OTC medicines + rest. Only suggest doctor if symptoms worsen.
- For HIGH risk: strongly recommend visiting doctor or call 108 ambulance immediately.

Respond ONLY with a JSON object (no markdown, no backticks):
{
  "severity": "normal or mild or moderate or severe",
  "riskLevel": "Low or Medium or High",
  "diagnosis": "2-3 sentence plain English diagnosis",
  "action": "specific Ayurvedic remedy or medicine based on severity and knowledge base"
}`,
        }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const clean = data.choices[0].message.content.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ error: 'Proxy error' });
  }
});

// ============================================
// SARVAM TRANSLATE ENDPOINT
// ============================================
app.post('/translate', async (req, res) => {
  try {
    const { text, target_language_code } = req.body;

    if (!text || !target_language_code) {
      return res.status(400).json({ error: 'text and target_language_code are required' });
    }

    // Skip translation for English
    if (target_language_code === 'en-IN') {
      return res.json({ translated_text: text });
    }

    const response = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': process.env.SARVAM_API_KEY,
      },
      body: JSON.stringify({
        input: text,
        source_language_code: 'en-IN',
        target_language_code,
        model: 'mayura:v1',
        enable_preprocessing: true,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data });
    res.json({ translated_text: data.translated_text });
  } catch (err) {
    console.error('Translate error:', err);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// ============================================
// SARVAM TTS ENDPOINT
// ============================================
app.post('/speak', async (req, res) => {
  try {
    const { text, target_language_code, speaker } = req.body;

    if (!text || !target_language_code || !speaker) {
      return res.status(400).json({ error: 'text, target_language_code and speaker are required' });
    }

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': process.env.SARVAM_API_KEY,
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code,
        speaker,
        model: 'bulbul:v3',
        pace: 1.0,
        enable_preprocessing: true,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.audios?.[0]) {
      return res.status(response.status).json({ error: data?.error || 'No audio returned' });
    }

    res.json({ audio: data.audios[0] }); // base64 WAV
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: 'TTS failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));