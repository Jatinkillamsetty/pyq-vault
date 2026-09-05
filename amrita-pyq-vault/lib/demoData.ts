import { PaperCardData } from "@/components/PaperCard";

export const DEMO_PAPERS: PaperCardData[] = [
  {
    id: "1",
    subjectCode: "PHY101",
    subjectName: "Laws of Motion",
    branch: "Physics",
    semester: 1,
    regulation: "2024",
    examType: "END_SEM",
    year: 2024,
    topTopic: "Newton's Laws & Friction",
    fileUrl: "#",
  },
  {
    id: "2",
    subjectCode: "CHM201",
    subjectName: "Chemical Thermodynamics",
    branch: "Physical Chemistry",
    semester: 1,
    regulation: "2024",
    examType: "MID_SEM",
    year: 2024,
    topTopic: "Enthalpy & Entropy",
    fileUrl: "#",
  },
  {
    id: "3",
    subjectCode: "MTH101",
    subjectName: "Limits & Differentiation",
    branch: "Mathematics",
    semester: 1,
    regulation: "2024",
    examType: "END_SEM",
    year: 2024,
    topTopic: "Chain Rule & L'Hopital",
    fileUrl: "#",
  },
];

export interface BranchMeta {
  code: string;
  name: string;
  category: "🔵 Physics" | "🟢 Chemistry" | "🔴 Mathematics";
  subCategory?: string;
}

export const SUBJECT_DATA = {
  Physics: [
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
  ],
  Chemistry: {
    "Physical Chemistry": [
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
    ],
    "Inorganic Chemistry": [
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
    ],
    "Organic Chemistry": [
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
    ],
  },
  Mathematics: [
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
  ],
};

export const BRANCHES: BranchMeta[] = [
  // 🔵 Physics
  { code: "Physics", name: "Physics (24 Units)", category: "🔵 Physics" },

  // 🟢 Chemistry
  { code: "Physical Chemistry", name: "Physical Chemistry (Units 1-11)", category: "🟢 Chemistry", subCategory: "Physical Chemistry" },
  { code: "Inorganic Chemistry", name: "Inorganic Chemistry (Units 12-21)", category: "🟢 Chemistry", subCategory: "Inorganic Chemistry" },
  { code: "Organic Chemistry", name: "Organic Chemistry (Units 22-32)", category: "🟢 Chemistry", subCategory: "Organic Chemistry" },

  // 🔴 Mathematics
  { code: "Mathematics", name: "Mathematics (28 Units)", category: "🔴 Mathematics" },
];
