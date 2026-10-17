// Approximate values per portion — good enough for awareness, not lab precision.

export const FOODS = [
  { id: 'whey', name: 'Whey (1 scoop)', kcal: 120, p: 24, cat: 'Protein' },
  { id: 'shake', name: 'Your shake (whey + 250 ml toned milk + ½ banana + berries)', kcal: 330, p: 33, cat: 'Protein' },
  { id: 'egg', name: 'Egg, whole', kcal: 72, p: 6, cat: 'Protein' },
  { id: 'eggwhite', name: 'Egg white', kcal: 17, p: 4, cat: 'Protein' },
  { id: 'paneer', name: 'Paneer (100 g)', kcal: 265, p: 18, cat: 'Protein' },
  { id: 'lfpaneer', name: 'Low-fat paneer (100 g)', kcal: 180, p: 20, cat: 'Protein' },
  { id: 'soya', name: 'Soya chunks (30 g dry)', kcal: 105, p: 16, cat: 'Protein' },
  { id: 'tofu', name: 'Tofu (100 g)', kcal: 120, p: 12, cat: 'Protein' },
  { id: 'greek', name: 'Greek yogurt / hung curd (150 g)', kcal: 130, p: 15, cat: 'Protein' },
  { id: 'curd', name: 'Curd (1 katori)', kcal: 90, p: 5, cat: 'Protein' },
  { id: 'milk', name: 'Toned milk (250 ml)', kcal: 145, p: 8, cat: 'Protein' },
  { id: 'dal', name: 'Dal (1 katori)', kcal: 150, p: 9, cat: 'Meals' },
  { id: 'rajma', name: 'Rajma / chole (1 katori)', kcal: 210, p: 10, cat: 'Meals' },
  { id: 'paneersabzi', name: 'Paneer sabzi (1 katori)', kcal: 250, p: 14, cat: 'Meals' },
  { id: 'sabzi', name: 'Mixed veg sabzi (1 katori)', kcal: 100, p: 3, cat: 'Meals' },
  { id: 'aloosabzi', name: 'Aloo sabzi (1 katori)', kcal: 160, p: 3, cat: 'Meals' },
  { id: 'chilla', name: 'Besan chilla (1)', kcal: 130, p: 7, cat: 'Meals' },
  { id: 'sprouts', name: 'Sprouts chaat (1 bowl)', kcal: 120, p: 8, cat: 'Meals' },
  { id: 'chapati', name: 'Chapati (1, no ghee)', kcal: 100, p: 3, cat: 'Carbs' },
  { id: 'paratha', name: 'Plain paratha (1)', kcal: 220, p: 4, cat: 'Carbs' },
  { id: 'alooparatha', name: 'Aloo paratha (1)', kcal: 300, p: 6, cat: 'Carbs' },
  { id: 'rice', name: 'Rice (1 katori cooked)', kcal: 195, p: 4, cat: 'Carbs' },
  { id: 'poha', name: 'Poha / upma (1 plate)', kcal: 250, p: 5, cat: 'Carbs' },
  { id: 'oats', name: 'Oats (40 g dry)', kcal: 150, p: 5, cat: 'Carbs' },
  { id: 'banana', name: 'Banana (1)', kcal: 100, p: 1, cat: 'Snacks' },
  { id: 'fruit', name: 'Fruit (apple / orange / papaya bowl)', kcal: 80, p: 1, cat: 'Snacks' },
  { id: 'chana', name: 'Roasted chana (30 g)', kcal: 110, p: 6, cat: 'Snacks' },
  { id: 'makhana', name: 'Roasted makhana (1 bowl, 25 g)', kcal: 95, p: 2, cat: 'Snacks' },
  { id: 'pb', name: 'Peanut butter (1 tbsp)', kcal: 95, p: 4, cat: 'Snacks' },
  { id: 'nuts', name: 'Nuts (small handful, 20 g)', kcal: 120, p: 4, cat: 'Snacks' },
  { id: 'chai', name: 'Chai with sugar (1 cup)', kcal: 90, p: 2, cat: 'Treats' },
  { id: 'sweet', name: 'Mithai (1 piece)', kcal: 180, p: 3, cat: 'Treats' },
  { id: 'samosa', name: 'Samosa / pakora plate', kcal: 300, p: 5, cat: 'Treats' },
  { id: 'biscuits', name: 'Biscuits (4)', kcal: 160, p: 2, cat: 'Treats' },
];

export const MEALS = {
  Breakfast: [
    { name: 'Egg bhurji + chapati', items: '2 eggs + 2 whites bhurji with onion-tomato, 1 chapati', kcal: 340, p: 24 },
    { name: 'Paneer-stuffed chapati', items: '1 chapati stuffed with 60 g paneer, curd on the side', kcal: 330, p: 18 },
    { name: 'Besan chilla ×2', items: '2 chillas with grated veg + mint chutney + curd', kcal: 350, p: 19 },
    { name: 'Protein oats', items: '40 g oats cooked in milk + ½ scoop whey + berries', kcal: 360, p: 25 },
  ],
  Lunch: [
    { name: 'Classic thali, smarter', items: '2 chapati + dal + paneer/soya sabzi + salad + curd', kcal: 600, p: 32 },
    { name: 'Rajma/chole rice', items: '1 katori rice + 1.5 katori rajma + salad + curd', kcal: 560, p: 22 },
    { name: 'Soya pulao bowl', items: '1 katori rice cooked with 30 g soya chunks + veg + raita', kcal: 480, p: 26 },
  ],
  'Post-workout': [
    { name: 'Your shake', items: 'Whey + toned milk + ½ banana + blueberries. Keep it — it\'s great.', kcal: 330, p: 33 },
  ],
  Snack: [
    { name: 'Chana + chai (less sugar)', items: '30 g roasted chana + chai with ½ tsp sugar', kcal: 160, p: 7 },
    { name: 'Greek yogurt bowl', items: '150 g hung curd + fruit + cinnamon', kcal: 200, p: 15 },
    { name: 'Sprouts chaat', items: 'Moong sprouts, onion, tomato, lemon, chaat masala', kcal: 120, p: 8 },
    { name: 'Makhana', items: '1 bowl roasted makhana with salt & pepper', kcal: 95, p: 2 },
  ],
  Dinner: [
    { name: 'Paneer bhurji + sabzi', items: '100 g low-fat paneer bhurji + big bowl of sabzi + 1 chapati', kcal: 420, p: 26 },
    { name: 'Tofu/paneer tikka plate', items: 'Grilled tikka with peppers & onions + mint chutney + salad', kcal: 380, p: 24 },
    { name: 'Dal + sabzi bowl', items: 'Big bowl dal + sabzi + 1 chapati (skip rice at night)', kcal: 400, p: 16 },
  ],
};

export const SWAPS = [
  { from: 'Aloo paratha (300 kcal)', to: 'Paneer-stuffed chapati, dry-roasted (230 kcal, +10 g protein)' },
  { from: 'Fried aloo / chips', to: 'Boiled aloo in a sabzi with peas, or air-fried wedges' },
  { from: '2 katori rice', to: '1 katori rice + extra dal and sabzi' },
  { from: 'Sugary chai ×3', to: 'Chai with ½ tsp sugar, max 2 cups' },
  { from: 'Biscuits with chai', to: 'Roasted chana or makhana' },
  { from: 'Butter paneer gravy', to: 'Paneer tikka / bhurji with tomato-onion base' },
  { from: 'Mithai after dinner', to: '2 dates or a square of dark chocolate' },
  { from: 'Late-night snacking', to: 'Brush teeth right after dinner. Kitchen closed.' },
];

export const CRAVINGS = {
  sweet: {
    label: 'Sweet', emoji: '🍫',
    fixes: ['Whey shake with cold milk + cocoa/cinnamon. Tastes like dessert, ~25 g protein.', '2 dates + 1 tsp peanut butter', 'Greek yogurt + honey drizzle + fruit', '1 square dark chocolate (70%+), eaten slowly'],
  },
  salty: {
    label: 'Salty / crunchy', emoji: '🥨',
    fixes: ['Roasted makhana with salt & pepper', 'Roasted chana', 'Cucumber + carrot sticks with hung curd dip', 'Sprouts chaat with lemon & chaat masala'],
  },
  fried: {
    label: 'Fried / junk', emoji: '🍟',
    fixes: ['Paneer tikka in a pan or air fryer', 'Besan chilla. Feels like pakora, much lighter', 'If you really want it: have ONE samosa, slowly, with chai. Then move on.'],
  },
  bored: {
    label: 'Bored / stressed', emoji: '😩',
    fixes: ['Go for a 10-minute walk outside', 'Drink a big glass of water or green tea', 'Text a friend, take a shower, or do 20 squats', 'Ask yourself: would I eat an apple right now? If no, it\'s not hunger.'],
  },
};

export const PLATE = [
  { part: 'Half', what: 'Sabzi / salad / raita', color: 'var(--good)' },
  { part: 'Quarter', what: 'Protein: paneer, dal, eggs, soya, tofu, curd', color: 'var(--accent)' },
  { part: 'Quarter', what: 'Carbs: 1–2 chapati OR 1 katori rice', color: 'var(--warn)' },
];
