/**
 * Rationale Extraction Service
 * Extracts approval rationales from credit memo text
 * 
 * Requirements: 2.1, LLM Extraction Errors handling
 */
import type { PendingRationale } from '../types';

/**
 * RationaleExtractor interface
 */
export interface RationaleExtractor {
  extractRationales(text: string): Promise<PendingRationale[]>;
}

/**
 * Result of rationale extraction
 */
export interface ExtractionResult {
  success: boolean;
  rationales?: PendingRationale[];
  error?: string;
}

/**
 * Generates a unique ID for rationales
 */
function generateId(): string {
  return `rat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extracts loan metadata from credit memo text
 */
export interface LoanMetadata {
  borrower?: string;
  facilityType?: string;
  facilityAmount?: string;
  tenor?: string;
  approvalDate?: string;
}

/**
 * Extracts loan metadata from credit memo text
 */
export function extractLoanMetadata(text: string): LoanMetadata {
  const metadata: LoanMetadata = {};
  
  // Extract borrower - handle various formats
  const borrowerMatch = text.match(/Borrower[:\s]+([A-Za-z][^\n\r]+?)(?=\s*(?:Facility|Loan|$))/i);
  if (borrowerMatch) metadata.borrower = borrowerMatch[1].trim();
  
  // Extract facility type
  const facilityTypeMatch = text.match(/Facility Type[:\s]+([^\n\r]+)/i);
  if (facilityTypeMatch) metadata.facilityType = facilityTypeMatch[1].trim();
  
  // Extract facility amount
  const amountMatch = text.match(/Facility Amount[:\s]+([^\n\r]+)/i);
  if (amountMatch) metadata.facilityAmount = amountMatch[1].trim();
  
  // Extract tenor
  const tenorMatch = text.match(/Tenor[:\s]+([^\n\r]+)/i);
  if (tenorMatch) metadata.tenor = tenorMatch[1].trim();
  
  // Extract approval date - try multiple patterns
  const datePatterns = [
    /Approval Date[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /Approval Date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /Approval Date[:\s]+([^\n\r]+)/i,
  ];
  
  for (const pattern of datePatterns) {
    const dateMatch = text.match(pattern);
    if (dateMatch) {
      metadata.approvalDate = dateMatch[1].trim();
      break;
    }
  }
  
  return metadata;
}

/**
 * Parses a date string like "July 8, 2023" into a Date object
 */
export function parseApprovalDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Clean up the string
  const cleaned = dateStr.trim().replace(/,/g, '');
  
  // Try parsing "Month Day Year" format (e.g., "July 8 2023")
  const monthDayYear = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})$/);
  if (monthDayYear) {
    const months: Record<string, number> = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3,
      'may': 4, 'june': 5, 'july': 6, 'august': 7,
      'september': 8, 'october': 9, 'november': 10, 'december': 11
    };
    const monthName = monthDayYear[1].toLowerCase();
    const day = parseInt(monthDayYear[2], 10);
    const year = parseInt(monthDayYear[3], 10);
    
    if (months[monthName] !== undefined && day >= 1 && day <= 31 && year >= 1900) {
      return new Date(year, months[monthName], day);
    }
  }
  
  // Try standard Date parsing as fallback
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 1900 && parsed.getFullYear() <= 2100) {
      return parsed;
    }
  } catch {
    // Fall through
  }
  
  return null;
}

/**
 * Extracts sections from credit memo text based on headers
 * Handles PDF text which may not have proper newlines
 */
function extractSections(text: string): Map<string, string> {
  const sections = new Map<string, string>();
  
  // Define section headers and their end markers
  const sectionDefs = [
    { name: 'Cash Flow Predictability', endMarkers: ['Asset Coverage', 'Collateral', 'Operational', 'Risk Factors', 'Approval Recommendation'] },
    { name: 'Asset Coverage', endMarkers: ['Operational', 'Risk Factors', 'Approval Recommendation', 'Cash Flow'] },
    { name: 'Operational Track Record', endMarkers: ['Risk Factors', 'Approval Recommendation', 'Prepared By'] },
    { name: 'Risk Factors and Mitigants', endMarkers: ['Approval Recommendation', 'Prepared By', 'Reviewed By'] },
    { name: 'Executive Summary', endMarkers: ['Key Approval', 'Cash Flow', 'Collateral', 'Risk Factors'] },
  ];
  
  for (const sectionDef of sectionDefs) {
    // Find the section header
    const headerRegex = new RegExp(sectionDef.name.replace(/\s+/g, '\\s*'), 'i');
    const headerMatch = text.match(headerRegex);
    
    if (headerMatch && headerMatch.index !== undefined) {
      const startIndex = headerMatch.index + headerMatch[0].length;
      
      // Find the end of this section (start of next section)
      let endIndex = text.length;
      for (const endMarker of sectionDef.endMarkers) {
        const endRegex = new RegExp(endMarker.replace(/\s+/g, '\\s*'), 'i');
        const endMatch = text.substring(startIndex).match(endRegex);
        if (endMatch && endMatch.index !== undefined) {
          const potentialEnd = startIndex + endMatch.index;
          if (potentialEnd < endIndex && potentialEnd > startIndex + 20) {
            endIndex = potentialEnd;
          }
        }
      }
      
      // Extract and clean the section content
      let content = text.substring(startIndex, endIndex).trim();
      
      // Clean up the content - remove extra whitespace but preserve readability
      content = content
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/^\s*[:\-]\s*/, '')  // Remove leading colons/dashes
        .trim();
      
      if (content.length > 20) {
        sections.set(sectionDef.name, content);
      }
    }
  }
  
  return sections;
}

/**
 * Mock rationale extraction that parses actual credit memo content
 * 
 * @param text - The text to extract rationales from
 * @returns Array of pending rationales
 */
export function mockExtractRationales(text: string): PendingRationale[] {
  const now = new Date();
  const rationales: PendingRationale[] = [];
  
  // Extract sections from the document
  const sections = extractSections(text);
  
  // Map sections to rationales with actual content
  const sectionMappings = [
    { sectionName: 'Cash Flow Predictability', title: 'Cash Flow Predictability' },
    { sectionName: 'Asset Coverage', title: 'Asset Coverage / Collateral' },
    { sectionName: 'Operational Track Record', title: 'Operational Track Record' },
    { sectionName: 'Risk Factors and Mitigants', title: 'Risk Factors and Mitigants' },
  ];
  
  for (const mapping of sectionMappings) {
    const sectionContent = sections.get(mapping.sectionName);
    if (sectionContent && sectionContent.length > 20) {
      rationales.push({
        id: generateId(),
        title: mapping.title,
        description: sectionContent.substring(0, 350).trim() + (sectionContent.length > 350 ? '...' : ''),
        extractedAt: now,
        sourceText: sectionContent,
      });
    }
  }
  
  // If no sections were found, fall back to keyword-based extraction with better context
  if (rationales.length === 0) {
    const lowerText = text.toLowerCase();
    const fallbackPatterns = [
      { keyword: 'cash flow', title: 'Cash Flow Analysis' },
      { keyword: 'collateral', title: 'Collateral Evaluation' },
      { keyword: 'management', title: 'Management Assessment' },
      { keyword: 'operational', title: 'Operational Assessment' },
      { keyword: 'risk', title: 'Risk Assessment' },
    ];
    
    for (const pattern of fallbackPatterns) {
      const keywordIndex = lowerText.indexOf(pattern.keyword);
      if (keywordIndex !== -1) {
        // Extract a sentence or two around the keyword
        const sentenceStart = Math.max(0, text.lastIndexOf('.', keywordIndex) + 1);
        const sentenceEnd = text.indexOf('.', keywordIndex + pattern.keyword.length);
        const endIndex = sentenceEnd !== -1 ? Math.min(sentenceEnd + 1, keywordIndex + 300) : keywordIndex + 300;
        
        const context = text.substring(sentenceStart, endIndex).trim();
        
        if (context.length > 30) {
          rationales.push({
            id: generateId(),
            title: pattern.title,
            description: context.substring(0, 350) + (context.length > 350 ? '...' : ''),
            extractedAt: now,
            sourceText: context,
          });
        }
      }
    }
  }
  
  // If still no rationales, create one from the executive summary or full text
  if (rationales.length === 0 && text.trim().length > 0) {
    const execSummary = sections.get('Executive Summary');
    const content = execSummary || text.substring(0, 500);
    
    rationales.push({
      id: generateId(),
      title: 'Approval Rationale',
      description: content.substring(0, 350).trim() + (content.length > 350 ? '...' : ''),
      extractedAt: now,
      sourceText: content,
    });
  }
  
  return rationales;
}


/**
 * OpenAI-based rationale extraction (optional)
 * Falls back to mock implementation if API key is not available
 * 
 * @param text - The text to extract rationales from
 * @param apiKey - Optional OpenAI API key
 * @returns Extraction result
 * 
 * Requirements: LLM Extraction Errors handling
 */
export async function extractRationalesWithLLM(
  text: string,
  apiKey?: string
): Promise<ExtractionResult> {
  // If no API key, use mock implementation
  if (!apiKey) {
    return {
      success: true,
      rationales: mockExtractRationales(text),
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing credit memos and extracting approval rationales. 
Extract distinct approval rationales from the provided text. 
For each rationale, provide a short title (max 100 chars) and a brief description (max 250 chars).
Return JSON array: [{"title": "...", "description": "..."}]`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from API');
    }

    // Parse the JSON response
    const parsed = JSON.parse(content);
    const now = new Date();

    const rationales: PendingRationale[] = parsed.map((item: { title: string; description: string }) => ({
      id: generateId(),
      title: item.title.substring(0, 100),
      description: item.description.substring(0, 250),
      extractedAt: now,
      sourceText: text.substring(0, 200),
    }));

    return {
      success: true,
      rationales,
    };
  } catch (error) {
    console.error('LLM extraction error:', error);
    
    // Check for timeout
    if (error instanceof Error && error.name === 'TimeoutError') {
      return {
        success: false,
        error: 'Extraction is taking longer than expected. Please try again.',
      };
    }

    // Fall back to mock implementation on API failure
    return {
      success: false,
      error: 'Unable to extract rationales. You may edit extracted rationales or re-run extraction.',
      rationales: mockExtractRationales(text), // Provide mock results as fallback
    };
  }
}

/**
 * Creates a RationaleExtractor instance
 * 
 * @param apiKey - Optional OpenAI API key for LLM extraction
 */
export function createRationaleExtractor(apiKey?: string): RationaleExtractor {
  return {
    extractRationales: async (text: string) => {
      const result = await extractRationalesWithLLM(text, apiKey);
      return result.rationales || [];
    },
  };
}

// Default mock extractor for demo purposes
export const mockRationaleExtractor = createRationaleExtractor();
