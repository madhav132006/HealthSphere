const AiAnalysis = require('../models/AiAnalysis');

// Mock AI responses for when Gemini API key is not available
const mockAnalyze = (symptoms, age, gender) => {
  const symptomLower = symptoms.toLowerCase();
  
  const responses = {
    headache: {
      conditions: [
        { name: 'Tension Headache', probability: 'High', description: 'Most common type of headache caused by muscle tension in the head, neck, and shoulders.' },
        { name: 'Migraine', probability: 'Medium', description: 'A neurological condition characterized by intense, debilitating headaches often accompanied by nausea.' },
        { name: 'Sinusitis', probability: 'Low', description: 'Inflammation of the sinuses that can cause facial pain and headache.' }
      ],
      medicines: [
        { name: 'Paracetamol (500mg)', type: 'OTC', dosage: '1-2 tablets every 4-6 hours', note: 'First-line treatment for mild headaches' },
        { name: 'Ibuprofen (400mg)', type: 'OTC', dosage: '1 tablet every 6-8 hours with food', note: 'Anti-inflammatory pain relief' },
        { name: 'Sumatriptan (50mg)', type: 'Prescription', dosage: 'As prescribed by doctor', note: 'Specifically for migraines - consult doctor first' }
      ],
      severity: 'low',
      advice: 'Rest in a quiet, dark room. Stay hydrated. Apply a cold compress to your forehead. If headaches persist for more than 3 days or are unusually severe, consult a doctor immediately.',
      seeDoctor: false
    },
    fever: {
      conditions: [
        { name: 'Viral Fever', probability: 'High', description: 'Common viral infection causing elevated body temperature, usually self-limiting.' },
        { name: 'Bacterial Infection', probability: 'Medium', description: 'Bacterial infections may require antibiotic treatment and proper diagnosis.' },
        { name: 'Dengue Fever', probability: 'Low', description: 'Mosquito-borne viral infection, especially common in tropical regions.' }
      ],
      medicines: [
        { name: 'Paracetamol (650mg)', type: 'OTC', dosage: '1 tablet every 6 hours', note: 'Primary fever reducer. Do NOT exceed 4g/day' },
        { name: 'ORS (Oral Rehydration Salt)', type: 'OTC', dosage: '1 packet in 1L water, sip throughout day', note: 'Prevents dehydration' },
        { name: 'Cetirizine (10mg)', type: 'OTC', dosage: '1 tablet at night', note: 'If accompanied by cold/allergy symptoms' }
      ],
      severity: 'medium',
      advice: 'Rest and stay hydrated. Monitor temperature every 4 hours. If fever exceeds 103°F (39.4°C) or persists beyond 3 days, seek medical attention immediately.',
      seeDoctor: true
    },
    cough: {
      conditions: [
        { name: 'Common Cold', probability: 'High', description: 'Upper respiratory tract infection usually caused by rhinovirus.' },
        { name: 'Acute Bronchitis', probability: 'Medium', description: 'Inflammation of the bronchial tubes causing persistent cough.' },
        { name: 'Allergic Rhinitis', probability: 'Medium', description: 'Allergic reaction causing sneezing, runny nose, and cough.' }
      ],
      medicines: [
        { name: 'Dextromethorphan Syrup', type: 'OTC', dosage: '10ml every 6-8 hours', note: 'Cough suppressant for dry cough' },
        { name: 'Ambroxol (30mg)', type: 'OTC', dosage: '1 tablet 2-3 times daily', note: 'For productive cough - helps thin mucus' },
        { name: 'Steam Inhalation', type: 'Home Remedy', dosage: '10-15 minutes, 2-3 times daily', note: 'Add eucalyptus oil for better relief' }
      ],
      severity: 'low',
      advice: 'Drink warm fluids like honey-lemon water. Gargle with warm salt water. If cough persists beyond 2 weeks or is accompanied by blood, see a doctor.',
      seeDoctor: false
    },
    stomach: {
      conditions: [
        { name: 'Gastritis', probability: 'High', description: 'Inflammation of the stomach lining causing pain, nausea, and discomfort.' },
        { name: 'Acid Reflux (GERD)', probability: 'Medium', description: 'Stomach acid flowing back into the esophagus causing heartburn.' },
        { name: 'Food Poisoning', probability: 'Medium', description: 'Illness caused by consuming contaminated food or water.' }
      ],
      medicines: [
        { name: 'Pantoprazole (40mg)', type: 'OTC', dosage: '1 tablet before breakfast', note: 'Reduces stomach acid production' },
        { name: 'Domperidone (10mg)', type: 'OTC', dosage: '1 tablet before meals', note: 'Relieves nausea and vomiting' },
        { name: 'Dicyclomine (20mg)', type: 'Prescription', dosage: 'As prescribed', note: 'For stomach cramps - consult doctor' }
      ],
      severity: 'medium',
      advice: 'Eat light, bland foods. Avoid spicy, oily foods and caffeine. Stay hydrated with ORS. If you notice blood in stool or severe persistent pain, visit a doctor immediately.',
      seeDoctor: true
    }
  };

  let matched = null;
  for (const [key, value] of Object.entries(responses)) {
    if (symptomLower.includes(key)) {
      matched = value;
      break;
    }
  }

  if (!matched) {
    matched = {
      conditions: [
        { name: 'General Discomfort', probability: 'Medium', description: 'Your symptoms may indicate various conditions that require further evaluation.' },
        { name: 'Stress-Related Symptoms', probability: 'Medium', description: 'Physical symptoms can often be manifestations of stress or anxiety.' },
        { name: 'Nutritional Deficiency', probability: 'Low', description: 'Some symptoms may be related to vitamin or mineral deficiencies.' }
      ],
      medicines: [
        { name: 'Multivitamin Supplement', type: 'OTC', dosage: '1 tablet daily after meal', note: 'General health supplement' },
        { name: 'Adequate Rest & Hydration', type: 'Lifestyle', dosage: '7-8 hours sleep, 2-3L water daily', note: 'Foundation of recovery' },
        { name: 'Consult a Specialist', type: 'Advice', dosage: 'N/A', note: 'For persistent or unclear symptoms, professional evaluation is recommended' }
      ],
      severity: 'low',
      advice: 'Monitor your symptoms for 24-48 hours. If symptoms worsen or new symptoms appear, consult a healthcare professional.',
      seeDoctor: true
    };
  }

  return {
    ...matched,
    disclaimer: '⚠️ This AI analysis is for informational purposes only and should NOT be considered as medical advice. Always consult a qualified healthcare professional for proper diagnosis and treatment.',
    analyzedAt: new Date().toISOString()
  };
};

const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, age, gender, duration } = req.body;

    if (!symptoms || symptoms.trim().length < 3) {
      return res.status(400).json({ message: 'Please describe your symptoms in detail.' });
    }

    let result;

    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `You are a medical AI assistant. A patient reports the following:
Symptoms: ${symptoms}
${age ? `Age: ${age}` : ''}
${gender ? `Gender: ${gender}` : ''}
${duration ? `Duration: ${duration}` : ''}

Respond ONLY in valid JSON format (no markdown, no code blocks) with this exact structure:
{
  "conditions": [
    {"name": "condition name", "probability": "High/Medium/Low", "description": "brief description"}
  ],
  "medicines": [
    {"name": "medicine name with dosage", "type": "OTC/Prescription/Home Remedy", "dosage": "how to take", "note": "important note"}
  ],
  "severity": "low/medium/high",
  "advice": "detailed advice paragraph",
  "seeDoctor": true/false
}

List 2-3 conditions and 2-3 medicines. Be medically accurate but note this is informational only.`;

        const genResult = await model.generateContent(prompt);
        const responseText = genResult.response.text().trim();
        
        let parsed;
        try {
          const cleanJson = responseText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
          parsed = JSON.parse(cleanJson);
        } catch (parseErr) {
          console.error('Failed to parse Gemini response, using mock:', parseErr);
          parsed = mockAnalyze(symptoms, age, gender);
        }

        result = {
          ...parsed,
          disclaimer: '⚠️ This AI analysis is for informational purposes only and should NOT be considered as medical advice. Always consult a qualified healthcare professional for proper diagnosis and treatment.',
          analyzedAt: new Date().toISOString(),
          aiPowered: true
        };
      } catch (aiError) {
        console.error('Gemini API error, falling back to mock:', aiError.message);
        result = { ...mockAnalyze(symptoms, age, gender), aiPowered: false };
      }
    } else {
      result = { ...mockAnalyze(symptoms, age, gender), aiPowered: false };
    }

    // Store analysis in MongoDB
    if (req.user) {
      await AiAnalysis.create({
        userId: req.user.id,
        symptoms,
        age,
        gender,
        duration,
        result
      });
    }

    res.json({ result });
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze symptoms.' });
  }
};

const getHistory = async (req, res) => {
  try {
    const analyses = await AiAnalysis.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ analyses });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history.' });
  }
};

module.exports = { analyzeSymptoms, getHistory };
