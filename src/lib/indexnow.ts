const INDEXNOW_KEY = '3bbe261c68784310999363997dc1f42f';
const HOST = 'the-global-word.vercel.app';
const URL_LIST = [
  `https://${HOST}/`,
];

export async function pingIndexNow() {
  console.log('📡 Pinging IndexNow...');
  
  const body = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: URL_LIST
  };

  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      console.log('✅ IndexNow ping successful!');
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('❌ IndexNow ping failed:', errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ IndexNow ping error:', error);
    return { success: false, error };
  }
}
