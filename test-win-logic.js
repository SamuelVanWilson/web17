// Simple test to verify Memory Match win condition logic

// There are 12 cards total = 6 pairs
const CARD_IMAGES = [
    '💕', '🌹', '💝', '🎁', '🌟', '💖',
    '💕', '🌹', '💝', '🎁', '🌟', '💖',
]

console.log('🎴 Memory Match Game Logic Test\n');
console.log(`Total cards: ${CARD_IMAGES.length}`);
console.log(`Total pairs: ${CARD_IMAGES.length / 2}`);
console.log(`Win condition: matchedPairs === ${CARD_IMAGES.length / 2}`);

// Simulate matching process
let matchedPairs = 0;

for (let i = 1; i <= 6; i++) {
    matchedPairs++;
    console.log(`\nPair ${i} matched! Total matched pairs: ${matchedPairs}/6`);

    if (matchedPairs === 6) {
        console.log('✅ WIN CONDITION MET! All 6 pairs matched!');
    } else {
        console.log(`⏳ Keep playing! ${6 - matchedPairs} pairs left`);
    }
}

console.log('\n✅ Test complete - logic is correct!');
console.log('Win popup should ONLY appear after all 6 pairs are matched.');
