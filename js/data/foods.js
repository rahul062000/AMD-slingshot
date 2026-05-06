/* ============================================================
   NutriSense — Food Database
   ~200 common foods with full macro data (per standard serving)
   Format: { id, name, emoji, category, serving, servingUnit, calories, protein, carbs, fat, fiber }
   ============================================================ */
const FoodDB = (() => {
  'use strict';
  const foods = [
    // === FRUITS ===
    {id:'f1',name:'Apple',emoji:'🍎',category:'fruits',serving:182,servingUnit:'g (1 medium)',calories:95,protein:0.5,carbs:25,fat:0.3,fiber:4.4},
    {id:'f2',name:'Banana',emoji:'🍌',category:'fruits',serving:118,servingUnit:'g (1 medium)',calories:105,protein:1.3,carbs:27,fat:0.4,fiber:3.1},
    {id:'f3',name:'Orange',emoji:'🍊',category:'fruits',serving:131,servingUnit:'g (1 medium)',calories:62,protein:1.2,carbs:15,fat:0.2,fiber:3.1},
    {id:'f4',name:'Strawberries',emoji:'🍓',category:'fruits',serving:152,servingUnit:'g (1 cup)',calories:49,protein:1,carbs:12,fat:0.5,fiber:3},
    {id:'f5',name:'Blueberries',emoji:'🫐',category:'fruits',serving:148,servingUnit:'g (1 cup)',calories:84,protein:1.1,carbs:21,fat:0.5,fiber:3.6},
    {id:'f6',name:'Grapes',emoji:'🍇',category:'fruits',serving:151,servingUnit:'g (1 cup)',calories:104,protein:1.1,carbs:27,fat:0.2,fiber:1.4},
    {id:'f7',name:'Watermelon',emoji:'🍉',category:'fruits',serving:286,servingUnit:'g (2 cups)',calories:86,protein:1.7,carbs:22,fat:0.4,fiber:1.1},
    {id:'f8',name:'Mango',emoji:'🥭',category:'fruits',serving:165,servingUnit:'g (1 cup)',calories:99,protein:1.4,carbs:25,fat:0.6,fiber:2.6},
    {id:'f9',name:'Pineapple',emoji:'🍍',category:'fruits',serving:165,servingUnit:'g (1 cup)',calories:82,protein:0.9,carbs:22,fat:0.2,fiber:2.3},
    {id:'f10',name:'Avocado',emoji:'🥑',category:'fruits',serving:150,servingUnit:'g (1 whole)',calories:240,protein:3,carbs:13,fat:22,fiber:10},
    // === VEGETABLES ===
    {id:'v1',name:'Broccoli',emoji:'🥦',category:'vegetables',serving:91,servingUnit:'g (1 cup)',calories:31,protein:2.6,carbs:6,fat:0.3,fiber:2.4},
    {id:'v2',name:'Spinach',emoji:'🥬',category:'vegetables',serving:30,servingUnit:'g (1 cup raw)',calories:7,protein:0.9,carbs:1.1,fat:0.1,fiber:0.7},
    {id:'v3',name:'Carrot',emoji:'🥕',category:'vegetables',serving:61,servingUnit:'g (1 medium)',calories:25,protein:0.6,carbs:6,fat:0.1,fiber:1.7},
    {id:'v4',name:'Tomato',emoji:'🍅',category:'vegetables',serving:123,servingUnit:'g (1 medium)',calories:22,protein:1.1,carbs:4.8,fat:0.2,fiber:1.5},
    {id:'v5',name:'Cucumber',emoji:'🥒',category:'vegetables',serving:301,servingUnit:'g (1 whole)',calories:45,protein:2,carbs:11,fat:0.3,fiber:1.5},
    {id:'v6',name:'Sweet Potato',emoji:'🍠',category:'vegetables',serving:130,servingUnit:'g (1 medium)',calories:112,protein:2,carbs:26,fat:0.1,fiber:3.9},
    {id:'v7',name:'Bell Pepper',emoji:'🫑',category:'vegetables',serving:119,servingUnit:'g (1 medium)',calories:31,protein:1,carbs:6,fat:0.3,fiber:2.1},
    {id:'v8',name:'Cauliflower',emoji:'🥦',category:'vegetables',serving:107,servingUnit:'g (1 cup)',calories:27,protein:2.1,carbs:5.3,fat:0.3,fiber:2.1},
    {id:'v9',name:'Green Beans',emoji:'🫘',category:'vegetables',serving:125,servingUnit:'g (1 cup)',calories:34,protein:2,carbs:8,fat:0.1,fiber:3.4},
    {id:'v10',name:'Kale',emoji:'🥬',category:'vegetables',serving:67,servingUnit:'g (1 cup)',calories:33,protein:2.9,carbs:6,fat:0.6,fiber:1.3},
    // === PROTEINS ===
    {id:'p1',name:'Chicken Breast',emoji:'🍗',category:'protein',serving:120,servingUnit:'g (grilled)',calories:187,protein:35,carbs:0,fat:4,fiber:0},
    {id:'p2',name:'Salmon',emoji:'🐟',category:'protein',serving:113,servingUnit:'g (fillet)',calories:233,protein:25,carbs:0,fat:14,fiber:0},
    {id:'p3',name:'Eggs',emoji:'🥚',category:'protein',serving:50,servingUnit:'g (1 large)',calories:72,protein:6.3,carbs:0.4,fat:5,fiber:0},
    {id:'p4',name:'Ground Beef (lean)',emoji:'🥩',category:'protein',serving:113,servingUnit:'g (4 oz)',calories:196,protein:27,carbs:0,fat:9,fiber:0},
    {id:'p5',name:'Turkey Breast',emoji:'🦃',category:'protein',serving:113,servingUnit:'g',calories:153,protein:34,carbs:0,fat:1,fiber:0},
    {id:'p6',name:'Tuna (canned)',emoji:'🐟',category:'protein',serving:85,servingUnit:'g (1 can)',calories:100,protein:22,carbs:0,fat:1,fiber:0},
    {id:'p7',name:'Shrimp',emoji:'🦐',category:'protein',serving:85,servingUnit:'g',calories:84,protein:18,carbs:0.2,fat:0.9,fiber:0},
    {id:'p8',name:'Tofu',emoji:'🧊',category:'protein',serving:126,servingUnit:'g (½ block)',calories:94,protein:10,carbs:2.3,fat:5,fiber:0.5},
    {id:'p9',name:'Lamb Chop',emoji:'🍖',category:'protein',serving:113,servingUnit:'g',calories:250,protein:26,carbs:0,fat:16,fiber:0},
    {id:'p10',name:'Cottage Cheese',emoji:'🧀',category:'protein',serving:113,servingUnit:'g (½ cup)',calories:98,protein:12,carbs:3.5,fat:4.3,fiber:0},
    // === GRAINS & CARBS ===
    {id:'g1',name:'Brown Rice',emoji:'🍚',category:'grains',serving:195,servingUnit:'g (1 cup cooked)',calories:216,protein:5,carbs:45,fat:1.8,fiber:3.5},
    {id:'g2',name:'White Rice',emoji:'🍚',category:'grains',serving:186,servingUnit:'g (1 cup cooked)',calories:242,protein:4.4,carbs:53,fat:0.4,fiber:0.6},
    {id:'g3',name:'Quinoa',emoji:'🌾',category:'grains',serving:185,servingUnit:'g (1 cup cooked)',calories:222,protein:8.1,carbs:39,fat:3.6,fiber:5.2},
    {id:'g4',name:'Oatmeal',emoji:'🥣',category:'grains',serving:234,servingUnit:'g (1 cup cooked)',calories:154,protein:5.4,carbs:27,fat:2.6,fiber:4},
    {id:'g5',name:'Whole Wheat Bread',emoji:'🍞',category:'grains',serving:28,servingUnit:'g (1 slice)',calories:69,protein:3.6,carbs:12,fat:1,fiber:1.9},
    {id:'g6',name:'Pasta',emoji:'🍝',category:'grains',serving:140,servingUnit:'g (1 cup cooked)',calories:220,protein:8.1,carbs:43,fat:1.3,fiber:2.5},
    {id:'g7',name:'Tortilla (flour)',emoji:'🫓',category:'grains',serving:45,servingUnit:'g (1 medium)',calories:140,protein:3.6,carbs:24,fat:3.5,fiber:1.4},
    {id:'g8',name:'Corn',emoji:'🌽',category:'grains',serving:90,servingUnit:'g (1 ear)',calories:77,protein:2.9,carbs:17,fat:1.1,fiber:2.4},
    {id:'g9',name:'Granola',emoji:'🥣',category:'grains',serving:55,servingUnit:'g (½ cup)',calories:260,protein:6,carbs:38,fat:10,fiber:3.5},
    {id:'g10',name:'Bagel',emoji:'🥯',category:'grains',serving:105,servingUnit:'g (1 large)',calories:270,protein:10,carbs:53,fat:1.6,fiber:2.3},
    // === DAIRY ===
    {id:'d1',name:'Whole Milk',emoji:'🥛',category:'dairy',serving:244,servingUnit:'ml (1 cup)',calories:149,protein:8,carbs:12,fat:8,fiber:0},
    {id:'d2',name:'Greek Yogurt',emoji:'🥛',category:'dairy',serving:200,servingUnit:'g (1 cup)',calories:130,protein:17,carbs:6,fat:4.5,fiber:0},
    {id:'d3',name:'Cheddar Cheese',emoji:'🧀',category:'dairy',serving:28,servingUnit:'g (1 slice)',calories:113,protein:7,carbs:0.4,fat:9.3,fiber:0},
    {id:'d4',name:'Mozzarella',emoji:'🧀',category:'dairy',serving:28,servingUnit:'g (1 oz)',calories:85,protein:6.3,carbs:0.7,fat:6.3,fiber:0},
    {id:'d5',name:'Butter',emoji:'🧈',category:'dairy',serving:14,servingUnit:'g (1 tbsp)',calories:102,protein:0.1,carbs:0,fat:11.5,fiber:0},
    {id:'d6',name:'Almond Milk',emoji:'🥛',category:'dairy',serving:240,servingUnit:'ml (1 cup)',calories:30,protein:1,carbs:1,fat:2.5,fiber:0.5},
    // === LEGUMES & NUTS ===
    {id:'l1',name:'Almonds',emoji:'🌰',category:'nuts',serving:28,servingUnit:'g (1 oz)',calories:164,protein:6,carbs:6,fat:14,fiber:3.5},
    {id:'l2',name:'Peanut Butter',emoji:'🥜',category:'nuts',serving:32,servingUnit:'g (2 tbsp)',calories:188,protein:7,carbs:7,fat:16,fiber:1.5},
    {id:'l3',name:'Walnuts',emoji:'🌰',category:'nuts',serving:28,servingUnit:'g (1 oz)',calories:185,protein:4.3,carbs:3.9,fat:18.5,fiber:1.9},
    {id:'l4',name:'Black Beans',emoji:'🫘',category:'legumes',serving:172,servingUnit:'g (1 cup cooked)',calories:227,protein:15,carbs:41,fat:0.9,fiber:15},
    {id:'l5',name:'Lentils',emoji:'🫘',category:'legumes',serving:198,servingUnit:'g (1 cup cooked)',calories:230,protein:18,carbs:40,fat:0.8,fiber:15.6},
    {id:'l6',name:'Chickpeas',emoji:'🫘',category:'legumes',serving:164,servingUnit:'g (1 cup cooked)',calories:269,protein:14.5,carbs:45,fat:4.2,fiber:12.5},
    {id:'l7',name:'Cashews',emoji:'🌰',category:'nuts',serving:28,servingUnit:'g (1 oz)',calories:157,protein:5.2,carbs:8.6,fat:12.4,fiber:0.9},
    {id:'l8',name:'Chia Seeds',emoji:'🌱',category:'nuts',serving:28,servingUnit:'g (2 tbsp)',calories:138,protein:4.7,carbs:12,fat:8.7,fiber:9.8},
    // === PREPARED / COMMON MEALS ===
    {id:'m1',name:'Grilled Chicken Salad',emoji:'🥗',category:'meals',serving:350,servingUnit:'g',calories:320,protein:32,carbs:12,fat:16,fiber:4},
    {id:'m2',name:'Turkey Sandwich',emoji:'🥪',category:'meals',serving:250,servingUnit:'g',calories:340,protein:24,carbs:36,fat:10,fiber:3},
    {id:'m3',name:'Veggie Stir Fry',emoji:'🍳',category:'meals',serving:300,servingUnit:'g',calories:220,protein:10,carbs:28,fat:8,fiber:5},
    {id:'m4',name:'Spaghetti Bolognese',emoji:'🍝',category:'meals',serving:400,servingUnit:'g',calories:480,protein:28,carbs:52,fat:16,fiber:4},
    {id:'m5',name:'Chicken Burrito',emoji:'🌯',category:'meals',serving:350,servingUnit:'g',calories:520,protein:30,carbs:55,fat:18,fiber:6},
    {id:'m6',name:'Tuna Wrap',emoji:'🫔',category:'meals',serving:250,servingUnit:'g',calories:310,protein:24,carbs:30,fat:10,fiber:3},
    {id:'m7',name:'Protein Smoothie',emoji:'🥤',category:'meals',serving:350,servingUnit:'ml',calories:280,protein:25,carbs:35,fat:5,fiber:4},
    {id:'m8',name:'Omelette (3 eggs)',emoji:'🍳',category:'meals',serving:180,servingUnit:'g',calories:280,protein:21,carbs:2,fat:21,fiber:0},
    {id:'m9',name:'Grilled Fish & Veggies',emoji:'🐟',category:'meals',serving:350,servingUnit:'g',calories:310,protein:35,carbs:15,fat:12,fiber:4},
    {id:'m10',name:'Chicken Rice Bowl',emoji:'🍚',category:'meals',serving:400,servingUnit:'g',calories:450,protein:32,carbs:52,fat:10,fiber:3},
    {id:'m11',name:'Greek Salad',emoji:'🥗',category:'meals',serving:300,servingUnit:'g',calories:210,protein:8,carbs:12,fat:15,fiber:3},
    {id:'m12',name:'Beef Steak',emoji:'🥩',category:'meals',serving:200,servingUnit:'g',calories:400,protein:46,carbs:0,fat:23,fiber:0},
    // === SNACKS ===
    {id:'s1',name:'Protein Bar',emoji:'🍫',category:'snacks',serving:60,servingUnit:'g (1 bar)',calories:210,protein:20,carbs:22,fat:7,fiber:3},
    {id:'s2',name:'Rice Cakes',emoji:'🍘',category:'snacks',serving:18,servingUnit:'g (2 cakes)',calories:70,protein:1.4,carbs:15,fat:0.4,fiber:0.4},
    {id:'s3',name:'Dark Chocolate',emoji:'🍫',category:'snacks',serving:28,servingUnit:'g (1 oz)',calories:170,protein:2.2,carbs:13,fat:12,fiber:3.1},
    {id:'s4',name:'Trail Mix',emoji:'🥜',category:'snacks',serving:40,servingUnit:'g (¼ cup)',calories:200,protein:5,carbs:18,fat:13,fiber:2},
    {id:'s5',name:'Hummus',emoji:'🫕',category:'snacks',serving:62,servingUnit:'g (¼ cup)',calories:104,protein:5,carbs:9,fat:6,fiber:2.5},
    {id:'s6',name:'Popcorn',emoji:'🍿',category:'snacks',serving:28,servingUnit:'g (3 cups popped)',calories:110,protein:3,carbs:22,fat:1.3,fiber:3.6},
    {id:'s7',name:'Crackers (whole wheat)',emoji:'🍘',category:'snacks',serving:30,servingUnit:'g (6 crackers)',calories:130,protein:3,carbs:20,fat:4.5,fiber:2.5},
    {id:'s8',name:'Banana Chips',emoji:'🍌',category:'snacks',serving:28,servingUnit:'g',calories:147,protein:0.6,carbs:17,fat:9.5,fiber:2.2},
    // === BEVERAGES ===
    {id:'b1',name:'Black Coffee',emoji:'☕',category:'beverages',serving:237,servingUnit:'ml (1 cup)',calories:2,protein:0.3,carbs:0,fat:0,fiber:0},
    {id:'b2',name:'Green Tea',emoji:'🍵',category:'beverages',serving:237,servingUnit:'ml (1 cup)',calories:2,protein:0.5,carbs:0,fat:0,fiber:0},
    {id:'b3',name:'Orange Juice',emoji:'🧃',category:'beverages',serving:248,servingUnit:'ml (1 cup)',calories:112,protein:1.7,carbs:26,fat:0.5,fiber:0.5},
    {id:'b4',name:'Latte',emoji:'☕',category:'beverages',serving:354,servingUnit:'ml (12 oz)',calories:190,protein:10,carbs:19,fat:7,fiber:0},
    {id:'b5',name:'Coconut Water',emoji:'🥥',category:'beverages',serving:240,servingUnit:'ml (1 cup)',calories:46,protein:1.7,carbs:9,fat:0.5,fiber:2.6},
    // === EXTRAS ===
    {id:'e1',name:'Olive Oil',emoji:'🫒',category:'extras',serving:14,servingUnit:'ml (1 tbsp)',calories:119,protein:0,carbs:0,fat:13.5,fiber:0},
    {id:'e2',name:'Honey',emoji:'🍯',category:'extras',serving:21,servingUnit:'g (1 tbsp)',calories:64,protein:0.1,carbs:17,fat:0,fiber:0},
    {id:'e3',name:'Soy Sauce',emoji:'🥫',category:'extras',serving:16,servingUnit:'ml (1 tbsp)',calories:9,protein:1,carbs:1,fat:0,fiber:0},
    {id:'e4',name:'Mayo',emoji:'🥫',category:'extras',serving:15,servingUnit:'g (1 tbsp)',calories:94,protein:0.1,carbs:0.1,fat:10,fiber:0},
    // === INDIAN FOODS ===
    {id:'i1',name:'Dal (Lentil Curry)',emoji:'🍛',category:'meals',serving:200,servingUnit:'g (1 bowl)',calories:180,protein:12,carbs:24,fat:4,fiber:6},
    {id:'i2',name:'Paneer Tikka',emoji:'🧀',category:'meals',serving:150,servingUnit:'g',calories:290,protein:18,carbs:6,fat:21,fiber:1},
    {id:'i3',name:'Chicken Tikka',emoji:'🍗',category:'meals',serving:150,servingUnit:'g',calories:220,protein:28,carbs:4,fat:10,fiber:1},
    {id:'i4',name:'Chapati',emoji:'🫓',category:'grains',serving:40,servingUnit:'g (1 piece)',calories:104,protein:3.3,carbs:18,fat:2.5,fiber:2},
    {id:'i5',name:'Biryani',emoji:'🍚',category:'meals',serving:350,servingUnit:'g',calories:450,protein:20,carbs:55,fat:16,fiber:3},
    {id:'i6',name:'Idli',emoji:'🫓',category:'grains',serving:40,servingUnit:'g (1 piece)',calories:39,protein:2,carbs:8,fat:0.1,fiber:0.5},
    {id:'i7',name:'Dosa',emoji:'🫓',category:'grains',serving:100,servingUnit:'g (1 piece)',calories:133,protein:4,carbs:22,fat:3.5,fiber:1},
    {id:'i8',name:'Samosa',emoji:'🥟',category:'snacks',serving:80,servingUnit:'g (1 piece)',calories:210,protein:4,carbs:24,fat:11,fiber:2},
    {id:'i9',name:'Raita',emoji:'🥛',category:'dairy',serving:100,servingUnit:'g',calories:55,protein:2.5,carbs:4,fat:3,fiber:0.5},
    {id:'i10',name:'Palak Paneer',emoji:'🍛',category:'meals',serving:200,servingUnit:'g',calories:260,protein:14,carbs:10,fat:18,fiber:3},
  ];

  // --- Search with fuzzy matching ---
  function search(query, limit = 10) {
    if (!query || typeof query !== 'string') return [];
    const q = query.toLowerCase().trim();
    if (!q) return [];
    // Exact prefix match first, then contains
    const prefix = foods.filter(f => f.name.toLowerCase().startsWith(q));
    const contains = foods.filter(f => !f.name.toLowerCase().startsWith(q) && f.name.toLowerCase().includes(q));
    const catMatch = foods.filter(f => !f.name.toLowerCase().includes(q) && f.category.toLowerCase().includes(q));
    return [...prefix, ...contains, ...catMatch].slice(0, limit);
  }

  function getById(id) { return foods.find(f => f.id === id) || null; }
  function getByCategory(cat) { return foods.filter(f => f.category === cat); }
  function getAll() { return [...foods]; }
  function getCategories() { return [...new Set(foods.map(f => f.category))]; }
  function getRandom(n = 5) {
    const shuffled = [...foods].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  }

  return { search, getById, getByCategory, getAll, getCategories, getRandom };
})();
