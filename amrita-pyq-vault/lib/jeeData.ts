import { PHYSICS_PYQS } from "./physicsData";
import { PHYSICS_PRACTICE_PYQS } from "./physicsPracticeData";
import { MATH_PRACTICE_PYQS } from "./mathPracticeData";
import { CHEM_PRACTICE_PYQS } from "./chemPracticeData";

export interface JeeQuestion {
  id: string;
  subject: "Physics" | "Chemistry" | "Mathematics";
  category?: "Physical Chemistry" | "Inorganic Chemistry" | "Organic Chemistry";
  chapter: string;
  subtopic: string;
  exam: "JEE Main" | "JEE Advanced";
  year: number;
  examDate?: string;
  session?: string;
  shift?: string;
  questionType?: "MCQ" | "Numerical";
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  options: { id: "A" | "B" | "C" | "D"; text: string }[];
  correctOption: "A" | "B" | "C" | "D";
  solution: string;
}

export const JEE_PYQS: JeeQuestion[] = [
  ...PHYSICS_PYQS,
  ...PHYSICS_PRACTICE_PYQS,
  ...MATH_PRACTICE_PYQS,
  ...CHEM_PRACTICE_PYQS,
  // 🔵 PHYSICS: Laws of Motion
  {
    id: "phy-lom-1",
    subject: "Physics",
    chapter: "Laws of Motion",
    subtopic: "Newton's Second Law & Friction",
    exam: "JEE Main",
    year: 2024,
    difficulty: "Medium",
    question: "A block of mass m = 2 kg rests on a rough horizontal plane with coefficient of static friction μ_s = 0.4. A horizontal force F is applied to the block. If F = 5 N, what is the magnitude of the frictional force acting on the block? (Take g = 10 m/s²)",
    options: [
      { id: "A", text: "8 N" },
      { id: "B", text: "5 N" },
      { id: "C", text: "2 N" },
      { id: "D", text: "0 N" },
    ],
    correctOption: "B",
    solution: "Maximum static friction force f_s(max) = μ_s * m * g = 0.4 * 2 * 10 = 8 N.\nSince the applied horizontal force F = 5 N is less than f_s(max) (8 N), the block remains at rest.\nTherefore, the static friction force adjusts itself to match the applied force: f_s = F = 5 N.",
  },
  {
    id: "phy-lom-2",
    subject: "Physics",
    chapter: "Laws of Motion",
    subtopic: "Pulleys & Tension Analysis",
    exam: "JEE Advanced",
    year: 2023,
    difficulty: "Hard",
    question: "Two blocks of masses m_1 = 3 kg and m_2 = 1 kg are connected by a light inextensible string passing over a frictionless light pulley. The acceleration of the system is:",
    options: [
      { id: "A", text: "g / 2" },
      { id: "B", text: "g / 4" },
      { id: "C", text: "g / 3" },
      { id: "D", text: "2g / 3" },
    ],
    correctOption: "A",
    solution: "The acceleration of Atwood's machine is given by a = ((m_1 - m_2) / (m_1 + m_2)) * g.\nSubstitute m_1 = 3 kg and m_2 = 1 kg:\na = ((3 - 1) / (3 + 1)) * g = (2 / 4) * g = g / 2.",
  },
  {
    id: "phy-kin-1",
    subject: "Physics",
    chapter: "Kinematics",
    subtopic: "Projectile Motion",
    exam: "JEE Main",
    year: 2024,
    difficulty: "Medium",
    question: "A projectile is thrown with an initial velocity u at an angle θ = 45° to the horizontal. If the horizontal range is 40 m, find the maximum height attained by the projectile.",
    options: [
      { id: "A", text: "20 m" },
      { id: "B", text: "10 m" },
      { id: "C", text: "40 m" },
      { id: "D", text: "15 m" },
    ],
    correctOption: "B",
    solution: "Relation between Range (R) and Maximum Height (H):\nR = 4 H cot(θ).\nGiven θ = 45°, cot(45°) = 1.\n40 = 4 H (1) ⇒ H = 10 m.",
  },
  {
    id: "phy-wep-1",
    subject: "Physics",
    chapter: "Work, Energy & Power",
    subtopic: "Conservation of Energy",
    exam: "JEE Main",
    year: 2023,
    difficulty: "Easy",
    question: "A particle of mass 0.5 kg falls freely from a height of 20 m. Its kinetic energy just before hitting the ground is: (g = 10 m/s²)",
    options: [
      { id: "A", text: "100 J" },
      { id: "B", text: "200 J" },
      { id: "C", text: "50 J" },
      { id: "D", text: "400 J" },
    ],
    correctOption: "A",
    solution: "By Conservation of Energy:\nKinetic Energy at bottom = Initial Potential Energy = m * g * h\nKE = 0.5 kg * 10 m/s² * 20 m = 100 J.",
  },

  // 🟢 CHEMISTRY: Physical Chemistry
  {
    id: "chm-thermo-1",
    subject: "Chemistry",
    category: "Physical Chemistry",
    chapter: "4. Chemical Thermodynamics",
    subtopic: "Enthalpy of Reaction & Hess Law",
    exam: "JEE Main",
    year: 2024,
    difficulty: "Medium",
    question: "For a ideal gas expanding reversibly and isothermally at 300 K from a volume of 2 L to 20 L, calculate the work done by 1 mole of the gas. (R = 8.314 J/mol K)",
    options: [
      { id: "A", text: "-5.74 kJ" },
      { id: "B", text: "-2.30 kJ" },
      { id: "C", text: "-11.48 kJ" },
      { id: "D", text: "+5.74 kJ" },
    ],
    correctOption: "A",
    solution: "For isothermal reversible expansion:\nW = -2.303 * n * R * T * log10(V2 / V1)\nW = -2.303 * 1 * 8.314 * 300 * log10(20 / 2)\nW = -2.303 * 8.314 * 300 * 1 = -5744 J = -5.74 kJ.",
  },
  {
    id: "chm-atomic-1",
    subject: "Chemistry",
    category: "Physical Chemistry",
    chapter: "2. Atomic Structure",
    subtopic: "Bohr Model & Rydberg Formula",
    exam: "JEE Advanced",
    year: 2023,
    difficulty: "Hard",
    question: "The shortest wavelength line in the Lyman series of the hydrogen atom spectrum is λ_L. The longest wavelength line in the Paschen series of the He+ ion spectrum is:",
    options: [
      { id: "A", text: "7 / (144 λ_L)" },
      { id: "B", text: "144 λ_L / 7" },
      { id: "C", text: "36 λ_L / 5" },
      { id: "D", text: "144 λ_L / 5" },
    ],
    correctOption: "B",
    solution: "For Lyman shortest wavelength (n1 = 1, n2 = ∞, Z = 1):\n1 / λ_L = R * (1)^2 * (1/1^2 - 0) = R ⇒ λ_L = 1 / R.\nFor He+ Paschen longest wavelength (n1 = 3, n2 = 4, Z = 2):\n1 / λ = R * (2)^2 * (1/3^2 - 1/4^2) = 4 R * (1/9 - 1/16) = 4 R * (7 / 144) = (7 R) / 36.\nλ = 36 / (7 R) = (36/7) * (4/4) λ_L = 144 λ_L / 7.",
  },
  {
    id: "chm-goc-1",
    subject: "Chemistry",
    category: "Organic Chemistry",
    chapter: "22. General Organic Chemistry (GOC)",
    subtopic: "Carbocation Stability",
    exam: "JEE Main",
    year: 2024,
    difficulty: "Easy",
    question: "Which of the following carbocations is the most stable?",
    options: [
      { id: "A", text: "(CH3)3C+" },
      { id: "B", text: "(CH3)2CH+" },
      { id: "C", text: "CH3CH2+" },
      { id: "D", text: "CH3+" },
    ],
    correctOption: "A",
    solution: "Tertiary carbocation (CH3)3C+ is hyperconjugated by 9 alpha-hydrogens, granting maximum inductive and hyperconjugative stabilization compared to secondary (6 alpha-H), primary (3 alpha-H), and methyl carbocations.",
  },

  // 🔴 MATHEMATICS: Calculus & Algebra
  {
    id: "mth-limits-1",
    subject: "Mathematics",
    chapter: "Limits",
    subtopic: "L'Hopital Rule & Standard Limits",
    exam: "JEE Main",
    year: 2024,
    difficulty: "Medium",
    question: "Evaluate the limit: lim (x -> 0) [ (sin 3x - 3 sin x) / x^3 ].",
    options: [
      { id: "A", text: "-4" },
      { id: "B", text: "4" },
      { id: "C", text: "-3" },
      { id: "D", text: "0" },
    ],
    correctOption: "A",
    solution: "Use the identity sin 3x = 3 sin x - 4 sin^3 x.\nsin 3x - 3 sin x = -4 sin^3 x.\nLimit = lim (x -> 0) [ (-4 sin^3 x) / x^3 ] = -4 * [ lim (x -> 0) (sin x / x) ]^3 = -4 * (1)^3 = -4.",
  },
  {
    id: "mth-matrices-1",
    subject: "Mathematics",
    chapter: "Matrices",
    subtopic: "Matrix Multiplication & Determinants",
    exam: "JEE Advanced",
    year: 2023,
    difficulty: "Hard",
    question: "Let A be a 3x3 real matrix such that det(A) = 4. If B = 2 adj(A), then det(B) is equal to:",
    options: [
      { id: "A", text: "128" },
      { id: "B", text: "64" },
      { id: "C", text: "32" },
      { id: "D", text: "256" },
    ],
    correctOption: "A",
    solution: "For an n x n matrix, det(k M) = k^n det(M).\nHere n = 3 and k = 2, so det(B) = det(2 adj(A)) = 2^3 det(adj(A)) = 8 * det(adj(A)).\nProperty of Adjugate: det(adj(A)) = (det(A))^(n-1) = 4^(3-1) = 4^2 = 16.\nTherefore, det(B) = 8 * 16 = 128.",
  },
  {
    id: "mth-prob-1",
    subject: "Mathematics",
    chapter: "Probability",
    subtopic: "Conditional Probability & Bayes Theorem",
    exam: "JEE Main",
    year: 2023,
    difficulty: "Easy",
    question: "If A and B are two independent events such that P(A) = 0.4 and P(B) = 0.5, find P(A ∪ B).",
    options: [
      { id: "A", text: "0.7" },
      { id: "B", text: "0.9" },
      { id: "C", text: "0.2" },
      { id: "D", text: "0.6" },
    ],
    correctOption: "A",
    solution: "For independent events: P(A ∩ B) = P(A) * P(B) = 0.4 * 0.5 = 0.20.\nP(A ∪ B) = P(A) + P(B) - P(A ∩ B) = 0.4 + 0.5 - 0.20 = 0.70.",
  },
];

export function getChapterPyqStats(subject: string, chapter: string) {
  const matching = JEE_PYQS.filter((q) => {
    if (q.subject !== subject) return false;
    if (chapter === "All") return true;
    const chLower = chapter.toLowerCase();
    const qChLower = q.chapter.toLowerCase();
    return qChLower.includes(chLower) || chLower.includes(qChLower);
  });

  const total = matching.length;
  const yearBreakdown: Record<number, { count: number; shifts: { shift: string; date?: string }[] }> = {};

  for (const q of matching) {
    const y = q.year;
    if (!yearBreakdown[y]) {
      yearBreakdown[y] = { count: 0, shifts: [] };
    }
    yearBreakdown[y].count += 1;
    const shiftLabel = `${q.session || ""} ${q.shift || "Shift 1"}`.trim();
    yearBreakdown[y].shifts.push({ shift: shiftLabel, date: q.examDate });
  }

  return { total, yearBreakdown };
}

export function getStoredCustomQuestions(): JeeQuestion[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("jee_custom_added_questions");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function addCustomQuestionToStorage(q: JeeQuestion) {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredCustomQuestions();
    const updated = [q, ...existing];
    localStorage.setItem("jee_custom_added_questions", JSON.stringify(updated));
    if (!JEE_PYQS.some((item) => item.id === q.id)) {
      JEE_PYQS.unshift(q);
    }
  } catch (e) {
    console.error("Failed to save custom question:", e);
  }
}

