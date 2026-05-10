const translationCache: Record<string, Record<string, string>> = {};

export async function translateBatch(words: string[], targetLang: string): Promise<Record<string, string>> {
  if (words.length === 0) return {};

  const results: Record<string, string> = {};
  const uniqueWords = Array.from(new Set(words.filter(Boolean)));

  words.forEach(w => { if(w) results[w] = w; });

  const wordsToTranslate = uniqueWords.filter(word => {
    const cached = translationCache[targetLang]?.[word.toLowerCase()];
    if (cached) {
      results[word] = cached;
      return false;
    }
    return true;
  });

  if (wordsToTranslate.length === 0) return results;

  const chunks = [];
  const chunkSize = 20;
  for (let i = 0; i < wordsToTranslate.length; i += chunkSize) {
    chunks.push(wordsToTranslate.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    await Promise.all(chunk.map(async (word) => {
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(word)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data[0] && data[0][0] && data[0][0][0]) {
            const translated = data[0][0][0];
            results[word] = translated;

            if (!translationCache[targetLang]) translationCache[targetLang] = {};
            translationCache[targetLang][word.toLowerCase()] = translated;
          }
        }
      } catch (e) {
        console.error(`Translation error for ${word}:`, e);
      }
    }));
  }

  return results;
}
