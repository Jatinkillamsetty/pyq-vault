import { PrismaClient, Role, ExamType, Regulation, PaperStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Branches
  const branchesData = [
    { code: "CSE", name: "Computer Science & Engineering" },
    { code: "ECE", name: "Electronics & Communication Engineering" },
    { code: "EEE", name: "Electrical & Electronics Engineering" },
    { code: "MECH", name: "Mechanical Engineering" },
    { code: "CIVIL", name: "Civil Engineering" },
    { code: "AI", name: "Artificial Intelligence" },
  ];

  const branches: Record<string, any> = {};
  for (const b of branchesData) {
    branches[b.code] = await prisma.branch.upsert({
      where: { code: b.code },
      update: {},
      create: b,
    });
  }

  // 2. Users (Admin & Student)
  const adminPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@amrita.edu" },
    update: { role: Role.ADMIN },
    create: {
      email: "admin@amrita.edu",
      name: "Admin User",
      password: adminPassword,
      role: Role.ADMIN,
      branchId: branches.CSE.id,
    },
  });

  const studentPassword = await bcrypt.hash("student123", 10);
  const studentUser = await prisma.user.upsert({
    where: { email: "student@cb.amrita.edu" },
    update: {},
    create: {
      email: "student@cb.amrita.edu",
      name: "Student User",
      password: studentPassword,
      role: Role.STUDENT,
      branchId: branches.CSE.id,
    },
  });

  // 3. Subjects
  const subjectsData = [
    {
      code: "21CSE201",
      name: "Data Structures & Algorithms",
      semester: 3,
      regulation: Regulation.R2021,
      branchId: branches.CSE.id,
    },
    {
      code: "23ECE211",
      name: "Microcontrollers & Interfacing",
      semester: 4,
      regulation: Regulation.R2023,
      branchId: branches.ECE.id,
    },
    {
      code: "21CSE203",
      name: "Computer Organization & Architecture",
      semester: 4,
      regulation: Regulation.R2021,
      branchId: branches.CSE.id,
    },
    {
      code: "21EEE207",
      name: "Electrical Machines I",
      semester: 4,
      regulation: Regulation.R2021,
      branchId: branches.EEE.id,
    },
    {
      code: "23AI214",
      name: "Foundations of Machine Learning",
      semester: 4,
      regulation: Regulation.R2023,
      branchId: branches.AI.id,
    },
    {
      code: "19MECH208",
      name: "Fluid Mechanics",
      semester: 4,
      regulation: Regulation.R2019,
      branchId: branches.MECH.id,
    },
  ];

  const subjects: Record<string, any> = {};
  for (const s of subjectsData) {
    subjects[s.code] = await prisma.subject.upsert({
      where: { code_regulation: { code: s.code, regulation: s.regulation } },
      update: {},
      create: s,
    });
  }

  // 4. Sample Papers
  const paper1 = await prisma.paper.create({
    data: {
      subjectId: subjects["21CSE201"].id,
      examType: ExamType.END_SEM,
      year: 2024,
      regulation: Regulation.R2021,
      fileUrl: "/uploads/sample-paper-1.pdf",
      status: PaperStatus.APPROVED,
      extractedTopics: [
        { topic: "AVL Tree Rotations", frequency: 5 },
        { topic: "BFS vs DFS Graph Traversal", frequency: 4 },
        { topic: "Dijkstra Algorithm", frequency: 4 },
        { topic: "Hashing Techniques", frequency: 3 },
      ],
      uploadedById: adminUser.id,
    },
  });

  const paper2 = await prisma.paper.create({
    data: {
      subjectId: subjects["21CSE201"].id,
      examType: ExamType.MID_SEM,
      year: 2023,
      regulation: Regulation.R2021,
      fileUrl: "/uploads/sample-paper-2.pdf",
      status: PaperStatus.APPROVED,
      extractedTopics: [
        { topic: "AVL Tree Rotations", frequency: 4 },
        { topic: "BFS vs DFS Graph Traversal", frequency: 3 },
        { topic: "Dijkstra Algorithm", frequency: 3 },
      ],
      uploadedById: adminUser.id,
    },
  });

  const paper3 = await prisma.paper.create({
    data: {
      subjectId: subjects["23ECE211"].id,
      examType: ExamType.MID_SEM,
      year: 2025,
      regulation: Regulation.R2023,
      fileUrl: "/uploads/sample-paper-1.pdf",
      status: PaperStatus.APPROVED,
      extractedTopics: [
        { topic: "Interrupt handling (ISR, vector table)", frequency: 5 },
        { topic: "Timer/Counter modules", frequency: 4 },
      ],
      uploadedById: adminUser.id,
    },
  });

  const paper4 = await prisma.paper.create({
    data: {
      subjectId: subjects["23AI214"].id,
      examType: ExamType.MID_SEM,
      year: 2025,
      regulation: Regulation.R2023,
      fileUrl: "/uploads/sample-paper-2.pdf",
      status: PaperStatus.PENDING,
      uploadedById: studentUser.id,
    },
  });

  // Create UploadQueue entry for paper4
  await prisma.uploadQueue.create({
    data: {
      paperId: paper4.id,
      status: PaperStatus.PENDING,
    },
  });

  // 5. Questions for Data Structures (paper1 & paper2)
  const questionsData = [
    {
      paperId: paper1.id,
      questionNo: "Q1",
      text: "Explain AVL tree rotations with examples.",
      marks: 10,
      unit: 2,
      topic: "AVL Trees",
    },
    {
      paperId: paper2.id,
      questionNo: "Q2a",
      text: "Describe the different rotations used in AVL trees.",
      marks: 10,
      unit: 2,
      topic: "AVL Trees",
    },
    {
      paperId: paper1.id,
      questionNo: "Q2",
      text: "Explain Breadth First Search (BFS) and Depth First Search (DFS) graph traversal algorithms with neat diagrams.",
      marks: 10,
      unit: 3,
      topic: "Graph Algorithms",
    },
    {
      paperId: paper2.id,
      questionNo: "Q3",
      text: "Compare BFS vs DFS graph traversal algorithms.",
      marks: 5,
      unit: 3,
      topic: "Graph Algorithms",
    },
    {
      paperId: paper1.id,
      questionNo: "Q3",
      text: "Explain Dijkstra's shortest path algorithm with an example graph.",
      marks: 10,
      unit: 4,
      topic: "Shortest Path",
    },
    {
      paperId: paper2.id,
      questionNo: "Q4b",
      text: "Describe Dijkstra algorithm and trace it on a given graph.",
      marks: 10,
      unit: 4,
      topic: "Shortest Path",
    },
    {
      paperId: paper1.id,
      questionNo: "Q4",
      text: "Explain Hashing techniques and collision resolution strategies.",
      marks: 8,
      unit: 5,
      topic: "Hashing",
    },
    {
      paperId: paper3.id,
      questionNo: "Q1",
      text: "Explain Interrupt handling mechanism in microcontrollers.",
      marks: 10,
      unit: 1,
      topic: "Interrupts",
    },
  ];

  for (const q of questionsData) {
    await prisma.question.create({ data: q });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
