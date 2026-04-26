const translationCache: Record<string, Record<string, string>> = {};

export async function translateBatch(words: string[], targetLang: string): Promise<Record<string, string>> {
  if (targetLang === 'en' || words.length === 0) {
    return Object.fromEntries(words.map(w => [w, w]));
  }

  const results: Record<string, string> = {};
  const wordsToTranslate: string[] = [];

  // 1. Check cache and find words that need translation
  for (const word of words) {
    if (!word) continue;
    if (translationCache[targetLang] && translationCache[targetLang][word.toLowerCase()]) {
      results[word] = translationCache[targetLang][word.toLowerCase()];
    } else {
      wordsToTranslate.push(word);
    }
  }

  if (wordsToTranslate.length === 0) return results;

  // 2. Translate unique words to avoid redundant calls
  const uniqueWords = Array.from(new Set(wordsToTranslate));
  
  try {
    // Google Translate GTX supports batching with multiple 'q' parameters
    // We'll do it in chunks of 50 to avoid URL length limits
    const chunkSize = 50;
    for (let i = 0; i < uniqueWords.length; i += chunkSize) {
      const chunk = uniqueWords.slice(i, i + chunkSize);
      const queryParams = chunk.map(w => `q=${encodeURIComponent(w)}`).join('&');
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&${queryParams}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        // The structure for multiple 'q' is an array of responses if using the right endpoint, 
        // but for 'single?client=gtx' it usually returns them in the same array structure.
        // Actually, for multiple 'q', it returns an array of results.
        
        chunk.forEach((word, idx) => {
          let translated = word;
          try {
            // Google Translate returns results in order
            if (data[idx] && data[idx][0] && data[idx][0][0]) {
               translated = data[idx][0][0];
            } else if (data[0] && data[0][idx] && data[0][idx][0]) {
               // Alternate format
               translated = data[0][idx][0];
            } else if (chunk.length === 1 && data[0][0][0]) {
               translated = data[0][0][0];
            }
          } catch (e) {}

          results[word] = translated;
          
          // Save to cache
          if (!translationCache[targetLang]) translationCache[targetLang] = {};
          translationCache[targetLang][word.toLowerCase()] = translated;
        });
      }
    }
  } catch (error) {
    console.error('Batch translation error:', error);
    // Fallback to original words for anything failed
    uniqueWords.forEach(w => {
      if (!results[w]) results[w] = w;
    });
  }

  return results;
}
