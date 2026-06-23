import 'dotenv/config';

async function scanForPromptInjections(text: string): Promise<boolean> {
  if (!process.env.ENKRYPT_API_KEY) {
    throw new Error("Missing ENKRYPTAI_API_KEY in environment variables.");
  }
  try {
    const response = await fetch(process.env.ENKRYPT_API_URL || 'https://api.enkryptai.com/guardrails/detect', {
      method: 'POST',
      headers: {
        'apikey': process.env.ENKRYPT_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        detectors: {
          injection_attack: { enabled: true },
          jailbreak: { enabled: true }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`EnKrypt AI API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.summary?.injection_attack === 1 || result.summary?.jailbreak === 1) {
      console.warn(`[SECURITY ALERT] Prompt injection detected by EnKrypt AI.`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to run EnKrypt guardrails:", error);
    return false; 
  }
}

export default scanForPromptInjections;