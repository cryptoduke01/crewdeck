/**
 * Highlights search terms in text
 */
export function highlightText(text: string, searchQuery: string): string {
  if (!searchQuery || !text) return text;

  const query = searchQuery.trim();
  if (!query) return text;

  // Split query into individual words
  const words = query.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 0) return text;

  // Create regex pattern that matches any of the words (case-insensitive)
  const pattern = new RegExp(`(${words.map(w => escapeRegex(w)).join('|')})`, 'gi');
  
  // Replace matches with highlighted version
  return text.replace(pattern, (match) => {
    return `<mark>${match}</mark>`;
  });
}

/**
 * Escapes special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Truncates text and highlights search terms
 */
export function highlightAndTruncate(text: string, searchQuery: string, maxLength: number = 150): string {
  if (!text) return '';
  
  const highlighted = highlightText(text, searchQuery);
  
  if (text.length <= maxLength) {
    return highlighted;
  }

  // Find the position of the first highlighted term
  const query = searchQuery.trim().toLowerCase();
  const words = query.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length > 0) {
    const firstWord = words[0];
    const index = text.toLowerCase().indexOf(firstWord.toLowerCase());
    
    if (index !== -1) {
      // Start a bit before the match
      const start = Math.max(0, index - 30);
      const end = Math.min(text.length, start + maxLength);
      
      let truncated = text.substring(start, end);
      if (start > 0) truncated = '...' + truncated;
      if (end < text.length) truncated = truncated + '...';
      
      return highlightText(truncated, searchQuery);
    }
  }

  // Fallback to simple truncation
  const truncated = text.substring(0, maxLength) + '...';
  return highlightText(truncated, searchQuery);
}
