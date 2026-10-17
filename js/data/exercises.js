// Exercise library. `img` is a folder in img/ex/ (free-exercise-db, public domain).
// type: weight = kg per dumbbell · band = band choice · bw = bodyweight reps · time = seconds
// For bw exercises that use a band for assistance, bands lists easiest → hardest.

export const EXERCISES = {
  // ───────── Chest ─────────
  db_bench: {
    name: 'Flat Dumbbell Press', group: 'Chest', muscles: 'Chest · front delts · triceps',
    img: 'Dumbbell_Bench_Press', type: 'weight', start: 10, rest: 90,
    cues: ['Shoulder blades squeezed back and down, slight arch', 'Lower dumbbells to chest level, elbows ~45° from body', 'Press up and slightly in, don\'t clank them together', '2 sec down, 1 sec up'],
    swaps: ['pushup', 'db_fly'],
  },
  incline_press: {
    name: 'Incline Dumbbell Press', group: 'Chest', muscles: 'Upper chest · front delts',
    img: 'Incline_Dumbbell_Press', type: 'weight', start: 8, rest: 90,
    cues: ['Bench at 30° (1–2 notches), not steeper', 'Feet planted, shoulder blades pinched', 'Lower to upper chest, press up over the collarbones'],
    swaps: ['db_bench', 'pushup'],
  },
  db_fly: {
    name: 'Dumbbell Fly', group: 'Chest', muscles: 'Chest',
    img: 'Dumbbell_Flyes', type: 'weight', start: 5, rest: 60,
    cues: ['Soft bend in elbows, keep it fixed', 'Open wide until you feel a chest stretch', 'Hug a big tree on the way up'],
    swaps: ['db_bench'],
  },
  pushup: {
    name: 'Push-up', group: 'Chest', muscles: 'Chest · triceps · core',
    img: 'Pushups', type: 'bw', rest: 60,
    cues: ['Body in one straight line — squeeze glutes', 'Hands a bit wider than shoulders', 'Chest to fist-height off the floor'],
    swaps: ['incline_pushup'],
  },
  incline_pushup: {
    name: 'Incline Push-up (hands on bench)', group: 'Chest', muscles: 'Chest · triceps',
    img: 'Incline_Push-Up', type: 'bw', rest: 60,
    cues: ['Hands on bench edge, body straight', 'Easier version of push-ups — great for high reps'],
    swaps: ['pushup'],
  },

  // ───────── Back ─────────
  db_row: {
    name: 'One-Arm Dumbbell Row', group: 'Back', muscles: 'Lats · mid back · biceps',
    img: 'One-Arm_Dumbbell_Row', type: 'weight', start: 12, rest: 75, perSide: true,
    cues: ['Knee and hand on bench, back flat like a table', 'Pull the dumbbell to your hip pocket, not your chest', 'Pause 1 sec at top, lower slowly'],
    swaps: ['incline_row'],
  },
  incline_row: {
    name: 'Chest-Supported Incline Row', group: 'Back', muscles: 'Mid back · rear delts · lats',
    img: 'Dumbbell_Incline_Row', type: 'weight', start: 8, rest: 75,
    cues: ['Lie face down on the incline bench (30–45°)', 'Let arms hang, then drive elbows back', 'Squeeze shoulder blades together at the top'],
    swaps: ['db_row', 'reverse_fly'],
  },
  pullup_assist: {
    name: 'Band-Assisted Pull-up', group: 'Back', muscles: 'Lats · biceps · grip',
    img: 'Band_Assisted_Pull-Up', type: 'bw', rest: 120, bands: ['Hard band', 'Medium band', 'No band'],
    cues: ['Loop band over bar, put one knee/foot in it', 'Start from a dead hang, pull chest toward bar', 'Lower in 3 seconds — the way down builds strength', 'Can\'t do 3? Jump up and do slow negatives'],
    swaps: ['band_pulldown', 'chin_up'],
  },
  chin_up: {
    name: 'Chin-up (palms facing you)', group: 'Back', muscles: 'Lats · biceps',
    img: 'Chin-Up', type: 'bw', rest: 120, bands: ['Hard band', 'Medium band', 'No band'],
    cues: ['Shoulder-width underhand grip', 'Chin over bar, slow lower'],
    swaps: ['pullup_assist'],
  },
  band_pulldown: {
    name: 'Band Lat Pulldown', group: 'Back', muscles: 'Lats',
    img: 'Wide-Grip_Lat_Pulldown', type: 'band', rest: 60, bands: ['Medium band', 'Hard band'],
    imgNote: 'Photo shows a cable machine. Do the same thing with a band looped over your pull-up bar, kneeling underneath.',
    cues: ['Loop band over pull-up bar, kneel below it', 'Pull hands down to shoulders, elbows to your ribs', 'Chest up, don\'t lean back much', 'Control the band on the way up'],
    swaps: ['pullup_assist', 'db_row'],
  },
  face_pull: {
    name: 'Band Face Pull', group: 'Shoulders', muscles: 'Rear delts · upper back · posture',
    img: 'Face_Pull', type: 'band', rest: 45, bands: ['Medium band', 'Hard band'],
    imgNote: 'Photo shows a cable. Anchor the band at face height (pull-up bar or door) and do the same.',
    cues: ['Pull band toward your forehead, hands split apart', 'Elbows high, finish like a "double bicep" pose', 'Fixes rounded shoulders from desk work'],
    swaps: ['reverse_fly', 'band_pull_apart'],
  },
  band_pull_apart: {
    name: 'Band Pull-Apart', group: 'Shoulders', muscles: 'Rear delts · upper back',
    img: 'Band_Pull_Apart', type: 'band', rest: 30, bands: ['Medium band', 'Hard band'],
    cues: ['Arms straight at chest height', 'Pull band apart until it touches your chest', 'Squeeze shoulder blades, slow return'],
    swaps: ['face_pull'],
  },
  superman: {
    name: 'Superman Hold', group: 'Back', muscles: 'Lower back · glutes',
    img: 'Superman', type: 'time', rest: 30,
    cues: ['Lie face down, lift arms and legs together', 'Look at the floor, not up'],
    swaps: [],
  },

  // ───────── Shoulders ─────────
  db_ohp: {
    name: 'Seated Dumbbell Shoulder Press', group: 'Shoulders', muscles: 'Front & side delts · triceps',
    img: 'Dumbbell_Shoulder_Press', type: 'weight', start: 8, rest: 90,
    cues: ['Bench upright, back against the pad', 'Start at ear level, press straight up', 'Ribs down — don\'t arch your lower back'],
    swaps: ['incline_press'],
  },
  lat_raise: {
    name: 'Dumbbell Lateral Raise', group: 'Shoulders', muscles: 'Side delts (wider shoulders)',
    img: 'Side_Lateral_Raise', type: 'weight', start: 4, rest: 45,
    cues: ['Light weight, strict form — ego kills this one', 'Lead with elbows, stop at shoulder height', 'Pinkies slightly up, 2 sec down'],
    swaps: ['reverse_fly'],
  },
  reverse_fly: {
    name: 'Reverse Dumbbell Fly', group: 'Shoulders', muscles: 'Rear delts · upper back',
    img: 'Reverse_Flyes', type: 'weight', start: 4, rest: 45,
    cues: ['Hinge forward or lie face-down on incline bench', 'Soft elbows, raise arms out to the side', 'Squeeze between shoulder blades'],
    swaps: ['face_pull'],
  },

  // ───────── Arms ─────────
  oh_tri: {
    name: 'Overhead Dumbbell Triceps Extension', group: 'Arms', muscles: 'Triceps (long head)',
    img: 'Standing_Dumbbell_Triceps_Extension', type: 'weight', start: 8, rest: 60,
    cues: ['Hold one dumbbell with both hands overhead (seated is fine)', 'Elbows point forward, lower behind head', 'Only forearms move'],
    swaps: ['band_pushdown'],
  },
  band_pushdown: {
    name: 'Band Triceps Pushdown', group: 'Arms', muscles: 'Triceps',
    img: 'Triceps_Pushdown_-_Rope_Attachment', type: 'band', rest: 45, bands: ['Medium band', 'Hard band'],
    imgNote: 'Photo shows a cable rope. Loop your band over the pull-up bar and push down the same way.',
    cues: ['Elbows pinned to your sides', 'Push down until arms are straight, spread hands at bottom', 'Slow on the way up'],
    swaps: ['oh_tri'],
  },
  incline_curl: {
    name: 'Incline Dumbbell Curl', group: 'Arms', muscles: 'Biceps',
    img: 'Alternate_Incline_Dumbbell_Curl', type: 'weight', start: 5, rest: 60,
    cues: ['Sit back on 45° incline, arms hanging straight', 'Curl without moving elbows forward', 'Full stretch at bottom'],
    swaps: ['hammer_curl'],
  },
  hammer_curl: {
    name: 'Hammer Curl', group: 'Arms', muscles: 'Biceps · forearms',
    img: 'Alternate_Hammer_Curl', type: 'weight', start: 8, rest: 60,
    cues: ['Palms face each other', 'One arm at a time, no swinging'],
    swaps: ['incline_curl'],
  },

  // ───────── Legs ─────────
  goblet: {
    name: 'Goblet Squat', group: 'Legs', muscles: 'Quads · glutes · core',
    img: 'Goblet_Squat', type: 'weight', start: 12, rest: 90, oneDb: true,
    imgNote: 'Photo shows a kettlebell — hold one dumbbell vertically at your chest instead.',
    cues: ['Hold one dumbbell at chest, elbows inside knees', 'Sit down between your heels, chest tall', 'Go as low as you can with a flat back', 'Drive up through whole foot'],
    swaps: ['db_squat', 'bss'],
  },
  db_squat: {
    name: 'Dumbbell Squat', group: 'Legs', muscles: 'Quads · glutes',
    img: 'Dumbbell_Squat', type: 'weight', start: 10, rest: 90,
    cues: ['Dumbbells at your sides', 'Hips back and down, knees track over toes'],
    swaps: ['goblet'],
  },
  db_rdl: {
    name: 'Dumbbell Romanian Deadlift', group: 'Legs', muscles: 'Hamstrings · glutes · lower back',
    img: 'Stiff-Legged_Dumbbell_Deadlift', type: 'weight', start: 12, rest: 90,
    cues: ['Soft knees, push hips BACK like closing a car door with your butt', 'Dumbbells slide down your thighs', 'Stop when hamstrings are tight (around mid-shin)', '3 sec down, squeeze glutes to stand'],
    swaps: ['sl_rdl', 'glute_bridge'],
  },
  sl_rdl: {
    name: 'Single-Leg Romanian Deadlift', group: 'Legs', muscles: 'Hamstrings · glutes · balance',
    img: 'Kettlebell_One-Legged_Deadlift', type: 'weight', start: 8, rest: 60, perSide: true,
    imgNote: 'Photo shows a kettlebell — a dumbbell works exactly the same.',
    cues: ['Dumbbell in opposite hand to standing leg', 'Hinge forward, back leg goes up behind you', 'Hips stay square to the floor', 'Hold a wall with free hand if wobbly'],
    swaps: ['db_rdl'],
  },
  rev_lunge: {
    name: 'Reverse Lunge', group: 'Legs', muscles: 'Glutes · quads · hamstrings',
    img: 'Dumbbell_Rear_Lunge', type: 'weight', start: 6, rest: 75, perSide: true,
    cues: ['Long step BACK (targets glutes more)', 'Back knee drops toward floor', 'Push through front heel to return'],
    swaps: ['db_lunge', 'step_up'],
  },
  db_lunge: {
    name: 'Dumbbell Lunge', group: 'Legs', muscles: 'Quads · glutes',
    img: 'Dumbbell_Lunges', type: 'weight', start: 6, rest: 75, perSide: true,
    cues: ['Step forward, both knees to 90°', 'Torso upright'],
    swaps: ['rev_lunge'],
  },
  bss: {
    name: 'Bulgarian Split Squat', group: 'Legs', muscles: 'Quads · glutes (the best leg builder at home)',
    img: 'Split_Squat_with_Dumbbells', type: 'weight', start: 6, rest: 90, perSide: true,
    imgNote: 'Same movement, but put your back foot up on the bench behind you.',
    cues: ['Rear foot laces-down on bench', 'Front foot far enough forward that knee stays over foot', 'Drop straight down, slight forward lean for glutes', 'Start bodyweight-only if balance is tough'],
    swaps: ['rev_lunge', 'goblet'],
  },
  step_up: {
    name: 'Dumbbell Step-Up', group: 'Legs', muscles: 'Quads · glutes',
    img: 'Dumbbell_Step_Ups', type: 'weight', start: 6, rest: 75, perSide: true,
    cues: ['Whole foot on bench', 'Drive through that heel — don\'t push off the back foot', 'Control the step down'],
    swaps: ['rev_lunge'],
  },
  glute_bridge: {
    name: 'Dumbbell Glute Bridge', group: 'Legs', muscles: 'Glutes',
    img: 'Butt_Lift_Bridge', type: 'weight', start: 12, rest: 60, oneDb: true,
    imgNote: 'Rest one dumbbell across your hip bones (pad it with a towel).',
    cues: ['Feet flat, close to your butt', 'Push hips up, squeeze glutes hard 2 sec', 'Ribs down, don\'t arch'],
    swaps: ['sl_glute_bridge'],
  },
  sl_glute_bridge: {
    name: 'Single-Leg Glute Bridge', group: 'Legs', muscles: 'Glutes',
    img: 'Single_Leg_Glute_Bridge', type: 'bw', rest: 45, perSide: true,
    cues: ['One leg extended, push through the planted heel'],
    swaps: ['glute_bridge'],
  },
  calf_raise: {
    name: 'Standing Calf Raise', group: 'Legs', muscles: 'Calves',
    img: 'Standing_Dumbbell_Calf_Raise', type: 'weight', start: 12, rest: 45,
    cues: ['Balls of feet on a step or thick book', 'Full stretch at bottom, pause at top', 'Slow — no bouncing'],
    swaps: [],
  },

  // ───────── Core ─────────
  hanging_knee: {
    name: 'Hanging Knee Raise', group: 'Core', muscles: 'Lower abs · grip',
    img: 'Hanging_Leg_Raise', type: 'bw', rest: 60,
    imgNote: 'Photo shows straight legs (harder). Start with knees bent.',
    cues: ['Dead hang from pull-up bar', 'Curl knees toward chest — tilt pelvis up', 'No swinging, lower slowly'],
    swaps: ['reverse_crunch', 'dead_bug'],
  },
  plank: {
    name: 'Plank', group: 'Core', muscles: 'Core · shoulders',
    img: 'Plank', type: 'time', rest: 45,
    cues: ['Elbows under shoulders', 'Squeeze glutes and pull belly button in', 'Body straight — no sagging hips'],
    swaps: ['side_plank', 'dead_bug'],
  },
  side_plank: {
    name: 'Side Plank', group: 'Core', muscles: 'Obliques',
    img: 'Side_Bridge', type: 'time', rest: 30, perSide: true,
    cues: ['Elbow under shoulder, hips up high', 'Bend bottom knee to make it easier'],
    swaps: ['plank'],
  },
  dead_bug: {
    name: 'Dead Bug', group: 'Core', muscles: 'Deep core',
    img: 'Dead_Bug', type: 'bw', rest: 30,
    cues: ['Lower back pressed into the mat the whole time', 'Opposite arm and leg extend slowly', 'Exhale fully as you extend'],
    swaps: ['plank'],
  },
  reverse_crunch: {
    name: 'Reverse Crunch', group: 'Core', muscles: 'Lower abs',
    img: 'Reverse_Crunch', type: 'bw', rest: 45,
    cues: ['Knees bent, roll hips off the mat toward chest', 'Slow down — no momentum'],
    swaps: ['hanging_knee'],
  },
  russian_twist: {
    name: 'Russian Twist', group: 'Core', muscles: 'Obliques',
    img: 'Russian_Twist', type: 'bw', rest: 30,
    cues: ['Lean back 45°, chest tall', 'Rotate shoulders, not just arms'],
    swaps: [],
  },

  // ───────── Conditioning ─────────
  skipping: {
    name: 'Skipping Rope', group: 'Cardio', muscles: 'Calves · heart · lungs',
    img: 'Rope_Jumping', type: 'time', rest: 30,
    cues: ['Small hops, stay on balls of feet', 'Turn the rope with wrists, not arms', 'Trip? Just restart — no stress'],
    swaps: ['mountain_climber'],
  },
  mountain_climber: {
    name: 'Mountain Climbers', group: 'Cardio', muscles: 'Core · cardio',
    img: 'Mountain_Climbers', type: 'time', rest: 30,
    cues: ['Hands under shoulders, drive knees to chest fast', 'Keep hips low'],
    swaps: ['skipping'],
  },
  thruster: {
    name: 'Dumbbell Thruster', group: 'Cardio', muscles: 'Full body',
    img: 'Kettlebell_Thruster', type: 'weight', start: 5, rest: 30,
    imgNote: 'Photo shows a kettlebell — hold two dumbbells at your shoulders.',
    cues: ['Squat with dumbbells at shoulders', 'Stand up explosively and press overhead in one motion', 'Light weight, keep moving'],
    swaps: ['jump_squat'],
  },
  jump_squat: {
    name: 'Jump Squat', group: 'Cardio', muscles: 'Legs · power',
    img: 'Freehand_Jump_Squat', type: 'bw', rest: 30,
    cues: ['Quarter squat then jump', 'Land softly, knees bent'],
    swaps: ['thruster'],
  },

  // ───────── Warm-up & mobility ─────────
  arm_circles: { name: 'Arm Circles', group: 'Mobility', img: 'Arm_Circles', type: 'time', cues: ['Small to big circles, forward then back'] },
  shoulder_circles: { name: 'Shoulder Rolls', group: 'Mobility', img: 'Shoulder_Circles', type: 'time', cues: ['Roll shoulders up, back and down'] },
  band_dislocate: { name: 'Band Shoulder Dislocates', group: 'Mobility', img: null, type: 'bw', cues: ['Hold band wide with straight arms', 'Bring it over your head and behind you, then back', 'Go wider if it pinches'] },
  cat_camel: { name: 'Cat-Camel', group: 'Mobility', img: 'Cat_Stretch', type: 'bw', cues: ['On all fours, round the spine up then let it sag', 'Move slowly with your breath'] },
  worlds_greatest: { name: 'World\'s Greatest Stretch', group: 'Mobility', img: 'Worlds_Greatest_Stretch', type: 'bw', cues: ['Lunge, same-side elbow to floor', 'Rotate and reach that arm to the ceiling'] },
  bw_squat: { name: 'Bodyweight Squat', group: 'Mobility', img: 'Bodyweight_Squat', type: 'bw', cues: ['Easy pace, full depth'] },
  hip_circles: { name: 'Hip Circles', group: 'Mobility', img: 'Hip_Circles_prone', type: 'bw', cues: ['On all fours, draw big circles with your knee'] },
  leg_swings: { name: 'Leg Swings (front-back & side)', group: 'Mobility', img: null, type: 'bw', cues: ['Hold a wall, swing each leg 10× front-back, 10× side-to-side', 'Gradually increase range'] },
  ankle_rocks: { name: 'Ankle Rocks', group: 'Mobility', img: null, type: 'bw', cues: ['Half-kneel, push front knee forward over toes, heel down', '10 per side'] },
  bw_bridge: { name: 'Glute Bridge (bodyweight)', group: 'Mobility', img: 'Butt_Lift_Bridge', type: 'bw', cues: ['Wake up the glutes — squeeze at top'] },

  // ───────── Stretches ─────────
  chest_stretch: { name: 'Chest Stretch', group: 'Stretch', img: 'Behind_Head_Chest_Stretch', type: 'time', cues: ['Hands behind head, pull elbows back', 'Or: forearm on a door frame, step through'] },
  childs_pose: { name: 'Child\'s Pose (lat stretch)', group: 'Stretch', img: 'Childs_Pose', type: 'time', cues: ['Sit back on heels, arms long in front', 'Walk hands to each side for lats'] },
  triceps_stretch: { name: 'Triceps Stretch', group: 'Stretch', img: 'Triceps_Stretch', type: 'time', cues: ['Hand behind head, gently push elbow down'] },
  shoulder_stretch: { name: 'Cross-Body Shoulder Stretch', group: 'Stretch', img: null, type: 'time', cues: ['Pull one arm across your chest, hold'] },
  hamstring_stretch: { name: 'Hamstring Stretch', group: 'Stretch', img: 'Hamstring_Stretch', type: 'time', cues: ['Lie on back, one leg up, hold behind thigh'] },
  quad_stretch: { name: 'Quad Stretch', group: 'Stretch', img: 'Quad_Stretch', type: 'time', cues: ['Pull heel to butt, knees together'] },
  hip_flexor_stretch: { name: 'Hip Flexor Stretch', group: 'Stretch', img: 'Intermediate_Hip_Flexor_and_Quad_Stretch', type: 'time', cues: ['Half-kneel, squeeze back glute, shift hips forward'] },
  glute_stretch: { name: 'Glute Stretch', group: 'Stretch', img: 'Lying_Glute', type: 'time', cues: ['Lying figure-4, pull knee toward chest'] },
  calf_stretch: { name: 'Calf Stretch', group: 'Stretch', img: 'Calf_Stretch_Hands_Against_Wall', type: 'time', cues: ['Hands on wall, back heel down, leg straight'] },
};

export const ex = (id) => EXERCISES[id];
export const imgSrc = (id, frame = 0) => EXERCISES[id]?.img ? `img/ex/${EXERCISES[id].img}/${frame}.jpg` : null;
export const allImageUrls = () => [...new Set(Object.values(EXERCISES).filter((e) => e.img).flatMap((e) => [`img/ex/${e.img}/0.jpg`, `img/ex/${e.img}/1.jpg`]))];
