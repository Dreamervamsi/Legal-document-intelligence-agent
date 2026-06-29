interface TextSegment {
  text: string;
  page: number;
}

interface ValidationError {
  field: string;
  message: string;
}

function validateTextSegments(textSegments: any): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!textSegments) {
    errors.push({ field: 'textSegments', message: 'textSegments is required' });
    return { valid: false, errors };
  }

  if (!Array.isArray(textSegments)) {
    errors.push({ field: 'textSegments', message: 'textSegments must be an array' });
    return { valid: false, errors };
  }

  if (textSegments.length === 0) {
    errors.push({ field: 'textSegments', message: 'textSegments cannot be empty' });
    return { valid: false, errors };
  }

  if (textSegments.length > 1000) {
    errors.push({ field: 'textSegments', message: 'textSegments cannot exceed 1000 items' });
    return { valid: false, errors };
  }

  for (let i = 0; i < textSegments.length; i++) {
    const segment = textSegments[i];
    
    if (!segment || typeof segment !== 'object') {
      errors.push({ field: `textSegments[${i}]`, message: 'Each segment must be an object' });
      continue;
    }

    if (!segment.text || typeof segment.text !== 'string') {
      errors.push({ field: `textSegments[${i}].text`, message: 'Each segment must have a text field' });
    } else if (segment.text.length > 10000) {
      errors.push({ field: `textSegments[${i}].text`, message: 'Text segment cannot exceed 10000 characters' });
    } else if (segment.text.trim().length < 10) {
      errors.push({ field: `textSegments[${i}].text`, message: 'Text segment must be at least 10 characters' });
    }

    if (segment.page !== undefined) {
      if (typeof segment.page !== 'number' || segment.page < 0) {
        errors.push({ field: `textSegments[${i}].page`, message: 'Page must be a non-negative number' });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateRiskAnalysisRequest(body: any): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (body.useLLM !== undefined) {
    if (typeof body.useLLM !== 'boolean') {
      errors.push({ field: 'useLLM', message: 'useLLM must be a boolean' });
    }
  }

  return { valid: errors.length === 0, errors };
}

function sanitizeTextSegment(segment: TextSegment): TextSegment {
  return {
    text: segment.text.trim().substring(0, 10000),
    page: segment.page || 0,
  };
}

export { validateTextSegments, validateRiskAnalysisRequest, sanitizeTextSegment };
