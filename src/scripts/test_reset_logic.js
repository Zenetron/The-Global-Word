
function calculateMidnightUTC(lng, continent, now) {
    let offsetHours = Math.round(lng / 15);
    if (continent === 'Europe' && offsetHours < 1) offsetHours = 1;
    
    const countryNow = new Date(now.getTime() + offsetHours * 3600000);
    const y = countryNow.getUTCFullYear();
    const m = countryNow.getUTCMonth();
    const d = countryNow.getUTCDate();
    
    return new Date(Date.UTC(y, m, d) - offsetHours * 3600000);
}

const now = new Date("2026-04-26T22:10:00Z"); // 00:10 April 27th in France (UTC+2)

const testCases = [
    { name: 'France', lng: 2, continent: 'Europe' },
    { name: 'USA (NY)', lng: -74, continent: 'Amérique du Nord' },
    { name: 'Japan', lng: 139, continent: 'Asie' },
    { name: 'Australia (Sydney)', lng: 151, continent: 'Océanie' }
];

testCases.forEach(c => {
    const midnightUTC = calculateMidnightUTC(c.lng, c.continent, now);
    console.log(`${c.name}:`);
    console.log(`  Now (UTC): ${now.toISOString()}`);
    console.log(`  Midnight (UTC): ${midnightUTC.toISOString()}`);
    console.log(`  Status: ${now >= midnightUTC ? 'TODAY' : 'YESTERDAY (FILTERED)'}`);
});
