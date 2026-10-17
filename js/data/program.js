// 4-day Upper/Lower program. reps = [low, high] range for double progression.
// For time exercises reps are seconds.

export const ROTATION = ['UA', 'LA', 'UB', 'LB'];

export const WARMUPS = {
  upper: [
    { ex: 'arm_circles', dose: '30 sec' },
    { ex: 'shoulder_circles', dose: '20 sec' },
    { ex: 'band_dislocate', dose: '10 reps' },
    { ex: 'cat_camel', dose: '8 reps' },
    { ex: 'worlds_greatest', dose: '3 / side' },
    { ex: 'band_pull_apart', dose: '15 reps' },
    { ex: 'bw_squat', dose: '10 reps' },
  ],
  lower: [
    { ex: 'hip_circles', dose: '8 / side' },
    { ex: 'leg_swings', dose: '10 / side each way' },
    { ex: 'ankle_rocks', dose: '10 / side' },
    { ex: 'cat_camel', dose: '8 reps' },
    { ex: 'worlds_greatest', dose: '3 / side' },
    { ex: 'bw_bridge', dose: '15 reps' },
    { ex: 'bw_squat', dose: '15 reps' },
  ],
};

export const COOLDOWNS = {
  upper: [
    { ex: 'chest_stretch', dose: '30 sec' },
    { ex: 'childs_pose', dose: '45 sec' },
    { ex: 'triceps_stretch', dose: '20 sec / side' },
    { ex: 'shoulder_stretch', dose: '20 sec / side' },
    { ex: 'hip_flexor_stretch', dose: '30 sec / side' },
  ],
  lower: [
    { ex: 'hamstring_stretch', dose: '30 sec / side' },
    { ex: 'quad_stretch', dose: '30 sec / side' },
    { ex: 'hip_flexor_stretch', dose: '30 sec / side' },
    { ex: 'glute_stretch', dose: '30 sec / side' },
    { ex: 'calf_stretch', dose: '20 sec / side' },
  ],
};

export const WORKOUTS = {
  UA: {
    name: 'Upper A', focus: 'Push focus — chest, shoulders, triceps', zone: 'upper', mins: 45,
    main: [
      { ex: 'db_bench', sets: 3, reps: [8, 12] },
      { ex: 'db_row', sets: 3, reps: [10, 12] },
      { ex: 'db_ohp', sets: 3, reps: [8, 12] },
      { ex: 'band_pulldown', sets: 3, reps: [12, 15] },
      { ex: 'lat_raise', sets: 3, reps: [12, 15] },
      { ex: 'oh_tri', sets: 2, reps: [10, 12] },
    ],
    finisher: {
      name: 'Push-up burnout', note: 'As many good push-ups as you can. Drop to knees or bench when form breaks.',
      rounds: 2, steps: [{ ex: 'pushup', label: 'Push-ups — max reps', sec: 40 }, { label: 'Rest', sec: 40 }],
    },
  },
  LA: {
    name: 'Lower A', focus: 'Squat focus — quads, glutes, calves', zone: 'lower', mins: 45,
    main: [
      { ex: 'goblet', sets: 4, reps: [10, 12] },
      { ex: 'db_rdl', sets: 3, reps: [10, 12] },
      { ex: 'rev_lunge', sets: 3, reps: [8, 10] },
      { ex: 'glute_bridge', sets: 3, reps: [12, 15] },
      { ex: 'calf_raise', sets: 3, reps: [12, 15] },
    ],
    finisher: {
      name: 'Skipping intervals', note: 'Burns ~60–80 kcal in 6 minutes. Knees cranky? Swap to mountain climbers.',
      rounds: 6, steps: [{ ex: 'skipping', label: 'Skip!', sec: 30 }, { label: 'Rest', sec: 30 }],
    },
  },
  UB: {
    name: 'Upper B', focus: 'Pull focus — back, biceps, upper chest', zone: 'upper', mins: 45,
    main: [
      { ex: 'pullup_assist', sets: 3, reps: [3, 8] },
      { ex: 'incline_press', sets: 3, reps: [8, 12] },
      { ex: 'incline_row', sets: 3, reps: [10, 12] },
      { ex: 'face_pull', sets: 3, reps: [12, 15] },
      { ex: 'incline_curl', sets: 3, reps: [10, 12] },
      { ex: 'band_pushdown', sets: 2, reps: [12, 15] },
    ],
    finisher: {
      name: 'Posture + sweat circuit', note: 'Alternate the two moves. Keep breathing.',
      rounds: 4, steps: [{ ex: 'band_pull_apart', label: 'Band pull-aparts', sec: 30 }, { label: 'Rest', sec: 15 }, { ex: 'mountain_climber', label: 'Mountain climbers', sec: 30 }, { label: 'Rest', sec: 15 }],
    },
  },
  LB: {
    name: 'Lower B', focus: 'Hinge focus — glutes, hamstrings + abs', zone: 'lower', mins: 45,
    main: [
      { ex: 'bss', sets: 3, reps: [8, 10] },
      { ex: 'sl_rdl', sets: 3, reps: [8, 10] },
      { ex: 'step_up', sets: 3, reps: [8, 10] },
      { ex: 'hanging_knee', sets: 3, reps: [8, 12] },
      { ex: 'plank', sets: 3, reps: [30, 45] },
    ],
    finisher: {
      name: 'Thruster + skip circuit', note: 'The fat-burner. Light dumbbells (4–6 kg), move fast.',
      rounds: 4, steps: [{ ex: 'thruster', label: 'DB thrusters', sec: 40 }, { label: 'Rest', sec: 20 }, { ex: 'skipping', label: 'Skip!', sec: 40 }, { label: 'Rest', sec: 20 }],
    },
  },
};

export const ACTIVE_REST_OPTIONS = [
  { id: 'walk', label: 'Brisk walk', mins: 30, desc: '30 min, fast enough that talking is a bit hard. Best fat-loss tool there is.' },
  { id: 'skipmob', label: 'Skip + mobility', mins: 20, desc: '10 min skipping (1 min on / 30 s off) + 10 min stretching.' },
  { id: 'core', label: 'Core + walk', mins: 25, desc: '3 rounds: 12 dead bugs, 10 reverse crunches, 30 s side plank each side — then a 15 min walk.' },
  { id: 'other', label: 'Something else', mins: 20, desc: 'Sport, cycling, dancing, stairs — anything 20+ minutes.' },
];

// Week 7 is the recharge week: eat at maintenance, train lighter.
export const RECHARGE_WEEK = 7;
export const PROGRAM_WEEKS = 12;
