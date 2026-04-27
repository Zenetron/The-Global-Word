import { pingIndexNow } from '../lib/indexnow';

async function main() {
  console.log('🚀 Triggering manual IndexNow ping...');
  await pingIndexNow();
  process.exit(0);
}

main();
