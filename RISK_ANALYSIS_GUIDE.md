# Risk Classification and Scoring Layer - Usage Guide

This guide explains how to use the Risk Classification and Scoring Layer for legal document analysis.

## Overview

The Risk Classification and Scoring Layer provides automated analysis of legal documents to identify potential risks, categorize clauses, and generate actionable insights. It combines heuristic rule-based analysis with optional LLM-powered contextual analysis.

## Features

- **Clause Categorization**: Automatically identifies and categorizes legal clauses (termination, liability, payment terms, etc.)
- **Heuristic Analysis**: Rule-based risk detection using keyword matching and pattern recognition
- **LLM Integration**: Optional Groq AI-powered analysis for contextual risk assessment
- **Numerical Scoring**: Document-level (0-100) and clause-level (0-10) risk scoring
- **Decision Triggering**: Automated decision recommendations (approve, flag, review, block)
- **Multi-Category Analysis**: Financial, Compliance, Operational, and Legal risk categories

## Environment Variables

Add the following to your `.env` file:

```bash
# Required for LLM analysis
GROQ_API_KEY=your_groq_api_key_here

# Optional: Enable debug logging
DEBUG=true
```

## API Endpoints

### 1. Standalone Risk Analysis

**Endpoint**: `POST /risk/analyze-risk`

**Description**: Analyzes text segments for legal risks with optional LLM integration.

**Request Body**:
```json
{
  "textSegments": [
    {
      "text": "The parties agree that liability shall be unlimited...",
      "page": 1
    },
    {
      "text": "Either party may terminate this agreement immediately without notice...",
      "page": 2
    }
  ],
  "useLLM": true
}
```

**Parameters**:
- `textSegments` (required): Array of text segments with page numbers
- `useLLM` (optional): Enable LLM analysis (default: true)

**Response**:
```json
{
  "message": "Risk analysis completed successfully",
  "llmUsed": true,
  "result": {
    "clauses": [
      {
        "id": "clause-1",
        "type": "liability",
        "text": "The parties agree that liability shall be unlimited...",
        "page": 1,
        "confidence": 0.9,
        "riskLevel": "critical",
        "category": "financial"
      }
    ],
    "heuristicResults": [
      {
        "clauseId": "clause-1",
        "risks": ["High-risk keyword: unlimited liability"],
        "severity": 1.8,
        "factors": ["Financial risk: No liability cap"]
      }
    ],
    "riskScore": {
      "overallScore": 85,
      "categoryScores": {
        "financial": 90,
        "compliance": 70,
        "operational": 60,
        "legal": 80
      },
      "clauseScores": [
        {
          "clauseId": "clause-1",
          "score": 9.5,
          "factors": ["Unlimited financial exposure"]
        }
      ]
    },
    "decision": {
      "action": "block",
      "priority": "critical",
      "message": "CRITICAL: Document has extremely high risk score (85/100). Immediate review required before proceeding.",
      "triggeredBy": [
        "Overall risk score (85) exceeds critical threshold (81)",
        "1 critical clause(s) detected"
      ]
    }
  }
}
```

### 2. Document Context Analysis

**Endpoint**: `POST /risk/analyze-context`

**Description**: Analyzes overall document structure and identifies missing essential clauses.

**Request Body**:
```json
{
  "textSegments": [
    {
      "text": "This agreement is governed by the laws of California...",
      "page": 1
    }
  ]
}
```

**Response**:
```json
{
  "message": "Document context analysis completed",
  "context": {
    "overallAmbiguity": false,
    "missingEssentialClauses": ["termination", "liability"],
    "documentStructure": "Document lacks essential clauses for comprehensive risk assessment"
  }
}
```

### 3. Document Upload with Risk Analysis

**Endpoint**: `POST /upload?riskAnalysis=true`

**Description**: Upload PDF documents with optional risk analysis integration.

**Query Parameters**:
- `riskAnalysis` (optional): Set to `true` to enable risk analysis during upload

**Request**: Multipart form data with PDF files

**Response**:
```json
{
  "message": "Documents loaded and processed successfully.",
  "riskAnalysis": {
    "clauses": [...],
    "heuristicResults": [...],
    "riskScore": {...},
    "decision": {...}
  }
}
```

**Note**: If `riskAnalysis` is not enabled or fails, the document upload proceeds normally without risk data.

## Risk Scoring System

### Document-Level Score (0-100)

- **0-30**: Low risk - Info level
- **31-60**: Medium risk - Warning level
- **61-80**: High risk - Alert level
- **81-100**: Critical risk - Block level

### Clause-Level Score (0-10)

- **0-3**: Low risk clause
- **4-6**: Medium risk clause
- **7-8**: High risk clause
- **9-10**: Critical risk clause

### Risk Categories

- **Financial** (35% weight): Payment terms, liability, penalties
- **Compliance** (25% weight): Non-compete, confidentiality, regulatory
- **Legal** (25% weight): Governing law, dispute resolution, IP
- **Operational** (15% weight): Termination, force majeure, notices

## Decision Actions

- **approve**: Document may proceed with no additional review
- **flag**: Document should be reviewed for flagged issues
- **review**: Document requires comprehensive review before proceeding
- **block**: Document must not proceed without immediate legal review

## Supported Clause Types

- `termination` - Contract termination conditions
- `liability` - Liability and indemnification clauses
- `payment_terms` - Payment schedules and penalties
- `confidentiality` - Confidentiality and non-disclosure
- `force_majeure` - Force majeure provisions
- `governing_law` - Governing law and jurisdiction
- `dispute_resolution` - Dispute resolution mechanisms
- `non_compete` - Non-compete and non-solicitation
- `intellectual_property` - IP rights and ownership

## Usage Examples

### Example 1: Basic Risk Analysis

```bash
curl -X POST http://localhost:3000/risk/analyze-risk \
  -H "Content-Type: application/json" \
  -d '{
    "textSegments": [
      {
        "text": "The company shall have unlimited liability for any damages...",
        "page": 1
      }
    ],
    "useLLM": false
  }'
```

### Example 2: Risk Analysis with LLM

```bash
curl -X POST http://localhost:3000/risk/analyze-risk \
  -H "Content-Type: application/json" \
  -d '{
    "textSegments": [
      {
        "text": "This agreement may be terminated by either party with 30 days notice...",
        "page": 1
      }
    ],
    "useLLM": true
  }'
```

### Example 3: Upload with Risk Analysis

```bash
curl -X POST "http://localhost:3000/upload?riskAnalysis=true" \
  -F "documents=@contract.pdf"
```

## Error Handling

The API provides detailed error messages for validation failures:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "textSegments",
      "message": "textSegments cannot be empty"
    }
  ]
}
```

## Performance Considerations

- **Heuristic-only analysis**: < 1 second per document
- **Heuristic + LLM analysis**: 5-10 seconds per document (depends on document size)
- **Batch processing**: LLM analysis processes 5 clauses at a time to avoid rate limits
- **Fallback**: If LLM fails, analysis continues with heuristic-only results

## Configuration

Adjust risk thresholds and weights in `src/config/risk.config.ts`:

```typescript
export const DECISION_TRIGGERS = {
  criticalScore: 81,
  alertScore: 61,
  warningScore: 31,
  highRiskClauseCount: 3,
  criticalClauseCount: 1,
};

export const CATEGORY_WEIGHTS = [
  { category: 'financial', weight: 0.35 },
  { category: 'compliance', weight: 0.25 },
  { category: 'legal', weight: 0.25 },
  { category: 'operational', weight: 0.15 },
];
```

## Logging

Enable debug logging by setting `DEBUG=true` in your `.env` file. Logs include:

- Analysis start/completion
- Validation failures
- LLM analysis status
- Risk scores and decisions
- Error details with stack traces

## Integration Notes

- Risk analysis is **optional** and does not affect existing document upload functionality
- Qdrant metadata is enriched with risk scores when analysis is enabled
- All existing endpoints remain unchanged
- Graceful degradation ensures system stability even if risk analysis fails

## Best Practices

1. **Start with heuristic-only analysis** for faster initial processing
2. **Enable LLM analysis** for comprehensive risk assessment
3. **Review decision triggers** before implementing automated blocking
4. **Customize thresholds** based on your organization's risk tolerance
5. **Monitor logs** for LLM failures and fallback usage
6. **Validate inputs** before sending to API to avoid errors

## Troubleshooting

**Issue**: LLM analysis fails
- **Solution**: Check GROQ_API_KEY is set correctly. System will fallback to heuristic-only analysis.

**Issue**: No clauses detected
- **Solution**: Ensure text segments are properly formatted with at least 10 characters per segment.

**Issue**: Validation errors
- **Solution**: Check that textSegments is an array with valid text and page fields.

**Issue**: High false positive rate
- **Solution**: Adjust HEURISTIC_RULES in risk.config.ts or customize clause patterns.
