export interface ChapterOption {
  id: string;
  code: string;
  name: string;
  subject: "Physics" | "Chemistry" | "Mathematics";
  category: string;
}

export const JEE_SUBJECT_OPTIONS: ChapterOption[] = [
  { id: "jee-phy-all", code: "JEE_PHYSICS", name: "🔵 All Physics (24 Chapters)", subject: "Physics", category: "Full Subject" },
  { id: "jee-chem-all", code: "JEE_CHEMISTRY", name: "🟢 All Chemistry (32 Chapters)", subject: "Chemistry", category: "Full Subject" },
  { id: "jee-math-all", code: "JEE_MATHEMATICS", name: "🔴 All Mathematics (18 Chapters)", subject: "Mathematics", category: "Full Subject" },
];

export const JEE_PHYSICS_CHAPTERS: ChapterOption[] = [
  "Units & Measurements",
  "Kinematics",
  "Laws of Motion",
  "Work, Energy & Power",
  "Centre of Mass & System of Particles",
  "Rotational Motion",
  "Gravitation",
  "Properties of Solids & Liquids",
  "Thermodynamics",
  "Kinetic Theory of Gases",
  "Oscillations",
  "Waves",
  "Electrostatics",
  "Current Electricity",
  "Magnetic Effects of Current & Magnetism",
  "Electromagnetic Induction",
  "Alternating Current",
  "Electromagnetic Waves",
  "Ray Optics",
  "Wave Optics",
  "Dual Nature of Matter & Radiation",
  "Atoms & Nuclei",
  "Semiconductor Electronics",
  "Experimental Physics",
].map((ch, idx) => ({
  id: `phy-ch-${idx + 1}`,
  code: ch,
  name: `${idx + 1}. ${ch}`,
  subject: "Physics",
  category: "🔵 Physics",
}));

export const JEE_CHEMISTRY_CHAPTERS: ChapterOption[] = [
  // Physical
  "1. Some Basic Concepts of Chemistry",
  "2. Atomic Structure",
  "3. States of Matter",
  "4. Chemical Thermodynamics",
  "5. Chemical Equilibrium",
  "6. Ionic Equilibrium",
  "7. Redox Reactions",
  "8. Solutions",
  "9. Electrochemistry",
  "10. Chemical Kinetics",
  "11. Surface Chemistry",
  // Inorganic
  "12. Periodic Table & Periodicity",
  "13. Chemical Bonding",
  "14. Hydrogen",
  "15. s-Block Elements",
  "16. p-Block Elements",
  "17. d- & f-Block Elements",
  "18. Coordination Compounds",
  "19. Metallurgy",
  "20. Qualitative Analysis",
  "21. Environmental Chemistry",
  // Organic
  "22. General Organic Chemistry (GOC)",
  "23. Isomerism",
  "24. Hydrocarbons",
  "25. Haloalkanes & Haloarenes",
  "26. Alcohols, Phenols & Ethers",
  "27. Aldehydes, Ketones & Carboxylic Acids",
  "28. Amines",
  "29. Biomolecules",
  "30. Polymers",
  "31. Chemistry in Everyday Life",
  "32. Practical Organic Chemistry",
].map((ch, idx) => {
  let cat = "🟢 Physical Chemistry";
  if (idx >= 11 && idx < 21) cat = "🟢 Inorganic Chemistry";
  if (idx >= 21) cat = "🟢 Organic Chemistry";
  return {
    id: `chem-ch-${idx + 1}`,
    code: ch,
    name: ch,
    subject: "Chemistry",
    category: cat,
  };
});

export const JEE_MATH_CHAPTERS: ChapterOption[] = [
  "Quadratic Equations",
  "Complex Numbers",
  "Sequences & Series",
  "Permutations & Combinations",
  "Binomial Theorem",
  "Matrices & Determinants",
  "Probability",
  "Trigonometric Equations",
  "Straight Lines",
  "Circles",
  "Conic Sections",
  "Limits & Continuity",
  "Differentiation",
  "Application of Derivatives",
  "Integrals",
  "Differential Equations",
  "Vector Algebra",
  "3D Geometry",
].map((ch, idx) => ({
  id: `math-ch-${idx + 1}`,
  code: ch,
  name: `${idx + 1}. ${ch}`,
  subject: "Mathematics",
  category: "🔴 Mathematics",
}));

export const ALL_JEE_CHAPTER_OPTIONS: ChapterOption[] = [
  ...JEE_SUBJECT_OPTIONS,
  ...JEE_PHYSICS_CHAPTERS,
  ...JEE_CHEMISTRY_CHAPTERS,
  ...JEE_MATH_CHAPTERS,
];
