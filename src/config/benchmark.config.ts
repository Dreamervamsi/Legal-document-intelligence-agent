import type { DocumentType, DocumentTypeConfig } from '../types/benchmark.types.js';

export const DOCUMENT_TYPE_REQUIREMENTS: Record<DocumentType, DocumentTypeConfig> = {
  NDA: {
    documentType: 'NDA',
    mandatoryClauses: [
      'confidentiality',
      'governing_law',
      'term',
      'return_of_materials',
    ],
    optionalClauses: [
      'non_compete',
      'non_solicit',
      'intellectual_property',
      'dispute_resolution',
    ],
    clauseWeights: {
      confidentiality: 0.3,
      governing_law: 0.2,
      term: 0.2,
      return_of_materials: 0.15,
      non_compete: 0.05,
      non_solicit: 0.05,
      intellectual_property: 0.03,
      dispute_resolution: 0.02,
    },
  },
  MSA: {
    documentType: 'MSA',
    mandatoryClauses: [
      'termination',
      'liability',
      'payment_terms',
      'force_majeure',
      'dispute_resolution',
      'governing_law',
    ],
    optionalClauses: [
      'confidentiality',
      'intellectual_property',
      'non_compete',
      'indemnification',
      'limitation_of_liability',
    ],
    clauseWeights: {
      termination: 0.2,
      liability: 0.2,
      payment_terms: 0.15,
      force_majeure: 0.1,
      dispute_resolution: 0.1,
      governing_law: 0.1,
      confidentiality: 0.05,
      intellectual_property: 0.04,
      non_compete: 0.03,
      indemnification: 0.02,
      limitation_of_liability: 0.01,
    },
  },
  SAAS: {
    documentType: 'SAAS',
    mandatoryClauses: [
      'service_level_agreement',
      'data_processing',
      'uptime_guarantee',
      'termination',
      'liability',
      'payment_terms',
      'governing_law',
    ],
    optionalClauses: [
      'confidentiality',
      'intellectual_property',
      'data_security',
      'force_majeure',
      'dispute_resolution',
    ],
    clauseWeights: {
      service_level_agreement: 0.2,
      data_processing: 0.15,
      uptime_guarantee: 0.15,
      termination: 0.15,
      liability: 0.1,
      payment_terms: 0.1,
      governing_law: 0.05,
      confidentiality: 0.03,
      intellectual_property: 0.03,
      data_security: 0.02,
      force_majeure: 0.01,
      dispute_resolution: 0.01,
    },
  },
};

export const SIMILARITY_THRESHOLDS = {
  STANDARD: 0.85,
  NON_STANDARD: 0.6,
  FAVORABLE: 0.9,
};

export const BENCHMARK_COLLECTION = 'standard-clauses';

export const BENCHMARK_CONFIG = {
  topK: 3,
  minSimilarity: 0.5,
  embeddingDimension: 384,
};
