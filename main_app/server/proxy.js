const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// KNOWLEDGE BASE - Ayurvedic + Medical RAG
// ============================================
const knowledge = [
  // FEVER
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

  // COLD & COUGH
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

  // HEADACHE
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

  // FATIGUE
  {
    keywords: ['tired', 'fatigue', 'weakness', 'low energy', 'dark circles', 'sleepy', 'exhausted', 'no energy'],
    risk: 'Low',
    ayurvedic: 'Drink Ashwagandha milk at night. Sleep 7-8 hours daily. Eat iron rich foods like spinach, dates, jaggery. Reduce screen time before bed. Morning sunlight for 15 mins.',
    medicine: 'Multivitamin supplement daily.'
  },

  // STOMACH
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

  // CHEST
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

  // BREATHING
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

  // SKIN
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

  // SLEEP
  {
    keywords: ['cant sleep', 'insomnia', 'sleep problem', 'restless sleep', 'sleeplessness'],
    risk: 'Low',
    ayurvedic: 'Drink warm turmeric milk before bed. Avoid phone and screens 1 hour before sleep. Try Brahmi or Ashwagandha supplement. Sleep at fixed time daily. Apply warm oil on feet.',
    medicine: null
  },

  // STRESS & MENTAL
  {
    keywords: ['stress', 'anxiety', 'tension', 'overthinking', 'worry', 'panic', 'nervous'],
    risk: 'Low',
    ayurvedic: 'Practice deep breathing (Anulom Vilom) for 10 mins. Drink Brahmi tea. Try Ashwagandha supplement. Do light walk or yoga. Talk to someone you trust.',
    medicine: null
  },

  // BACK PAIN
  {
    keywords: ['back pain', 'back ache', 'lower back', 'spine pain'],
    risk: 'Low',
    ayurvedic: 'Apply warm sesame oil massage. Do gentle stretching. Avoid sitting for long hours. Sleep on firm mattress. Apply turmeric paste on painful area.',
    medicine: 'Ibuprofen 400mg or Diclofenac gel.'
  },

  // EYES
  {
    keywords: ['eye pain', 'red eyes', 'eye irritation', 'eye strain', 'watery eyes'],
    risk: 'Low',
    ayurvedic: 'Wash eyes with clean cold water. Apply rose water drops. Rest eyes from screens every 20 mins. Place cucumber slices on eyes.',
    medicine: 'Lubricating eye drops like Refresh or Tears Natural.'
  },

  // DIABETES RELATED
  {
    keywords: ['sugar', 'diabetes', 'excessive thirst', 'frequent urination', 'high blood sugar'],
    risk: 'Medium',
    ayurvedic: 'Drink bitter gourd (karela) juice in morning. Eat fenugreek seeds soaked in water. Reduce sugar and refined carbs. Exercise 30 mins daily.',
    medicine: 'Get blood sugar tested. Consult doctor for medication if needed.'
  },

  // DIZZINESS
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

  // Return highest risk match first
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
- For LOW risk / mild symptoms (mild fever, cold, fatigue, headache): suggest home remedies and Ayurvedic tips like tulsi tea, ginger, honey, rest. Do NOT say visit doctor.
- For MEDIUM risk (moderate fever, vomiting, breathlessness): suggest OTC medicines + rest. Only suggest doctor if symptoms worsen.
- For HIGH risk (chest pain, severe symptoms, very abnormal vitals): strongly recommend visiting doctor or call 108 ambulance immediately.
- Use the knowledge base remedies provided above for accurate specific advice.

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