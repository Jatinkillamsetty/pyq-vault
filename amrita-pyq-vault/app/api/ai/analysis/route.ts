import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JEE_PYQS } from "@/lib/jeeData";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectCode = searchParams.get("subjectCode") || "21CSE201";

  try {
    // If requesting a JEE subject or specific JEE Chapter
    const cleanSearch = subjectCode.replace(/^[A-Z0-9_]+\s*-\s*/, "").replace(/^\d+\.\s*/, "").replace(/^JEE_/, "").trim();

    const isFullSubject = ["JEE_PHYSICS", "JEE_CHEMISTRY", "JEE_MATHEMATICS", "PHYSICS", "CHEMISTRY", "MATHEMATICS"].includes(subjectCode.toUpperCase());
    
    let matchedSubjectName = "Physics";
    if (subjectCode.toUpperCase().includes("CHEM")) matchedSubjectName = "Chemistry";
    if (subjectCode.toUpperCase().includes("MATH")) matchedSubjectName = "Mathematics";

    const chapterMatchedQuestions = JEE_PYQS.filter((q) => {
      if (isFullSubject) {
        return q.subject.toLowerCase() === matchedSubjectName.toLowerCase();
      }
      const chClean = q.chapter.replace(/^\d+\.\s*/, "").toLowerCase();
      const searchClean = cleanSearch.toLowerCase();
      return chClean.includes(searchClean) || searchClean.includes(chClean) || q.subject.toLowerCase() === searchClean;
    });

    const filteredQuestions = chapterMatchedQuestions.length > 0 ? chapterMatchedQuestions : JEE_PYQS.filter((q) => q.subject.toLowerCase() === matchedSubjectName.toLowerCase());

    if (filteredQuestions.length > 0) {
      const topicStats: Record<
        string,
        {
          topic: string;
          frequency: number;
          totalMarks: number;
          years: Set<number>;
          units: Set<number>;
          sampleQuestions: string[];
        }
      > = {};

      for (const q of filteredQuestions) {
        // If full subject, group by chapter. If specific chapter, group by subtopic!
        const topic = isFullSubject ? q.chapter : (q.subtopic || q.chapter);
        if (!topicStats[topic]) {
          topicStats[topic] = {
            topic,
            frequency: 0,
            totalMarks: 0,
            years: new Set(),
            units: new Set(),
            sampleQuestions: [],
          };
        }
        topicStats[topic].frequency += 1;
        topicStats[topic].totalMarks += 4;
        topicStats[topic].years.add(q.year);
        if (topicStats[topic].sampleQuestions.length < 3) {
          topicStats[topic].sampleQuestions.push(q.question);
        }
      }

      const rankedTopics = Object.values(topicStats).map((stat) => {
        const yearArray = Array.from(stat.years).sort((a, b) => b - a);
        const priorityScore = stat.frequency * 2 + yearArray.length * 3;

        let priorityTier: "HIGH" | "MEDIUM" | "LOW" = "LOW";
        if (stat.frequency >= (isFullSubject ? 15 : 4)) {
          priorityTier = "HIGH";
        } else if (stat.frequency >= (isFullSubject ? 8 : 2)) {
          priorityTier = "MEDIUM";
        }

        const yearsStr = yearArray.join(", ");
        const explanation = `Contains ${stat.frequency} genuine questions & PYQs across years [${yearsStr}].`;

        return {
          topic: stat.topic,
          frequency: stat.frequency,
          totalMarks: stat.totalMarks,
          years: yearArray,
          units: [1],
          priorityScore,
          priorityTier,
          explanation,
          sampleQuestions: stat.sampleQuestions,
        };
      });

      rankedTopics.sort((a, b) => b.frequency - a.frequency);

      const highPriority = rankedTopics.filter((t) => t.priorityTier === "HIGH");
      const mediumPriority = rankedTopics.filter((t) => t.priorityTier === "MEDIUM");
      const lowPriority = rankedTopics.filter((t) => t.priorityTier === "LOW");

      // Calculate 5 subtopic/unit cards for the chapter distribution
      const unitDist = rankedTopics.slice(0, 5).map((t, idx) => ({
        unit: idx + 1,
        questionCount: t.frequency,
        totalMarks: t.totalMarks,
        subtopicName: t.topic,
      }));

      return NextResponse.json({
        subject: {
          code: subjectCode,
          name: isFullSubject ? `JEE Main & Advanced ${matchedSubjectName}` : cleanSearch,
          branch: "JEE Prep",
          semester: 1,
          regulation: "2026",
        },
        totalPapersAnalyzed: 12,
        totalQuestionsAnalyzed: filteredQuestions.length,
        priorityBreakdown: {
          high: highPriority.length ? highPriority : rankedTopics.slice(0, 4),
          medium: mediumPriority.length ? mediumPriority : rankedTopics.slice(4, 8),
          low: lowPriority.length ? lowPriority : rankedTopics.slice(8),
        },
        unitDistribution: unitDist.length > 0 ? unitDist : [
          { unit: 1, questionCount: filteredQuestions.length, totalMarks: filteredQuestions.length * 4 }
        ],
        allTopics: rankedTopics,
      });
    }

    const subject = await prisma.subject.findFirst({
      where: { code: subjectCode },
      include: { branch: true },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found." }, { status: 404 });
    }

    const papers = await prisma.paper.findMany({
      where: { subjectId: subject.id, status: "APPROVED" },
      include: {
        questions: true,
      },
      orderBy: { year: "desc" },
    });

    const totalPapers = papers.length;
    const allQuestions = papers.flatMap((p) =>
      p.questions.map((q) => ({ ...q, year: p.year, examType: p.examType }))
    );

    // Aggregate metrics by Topic
    const topicStats: Record<
      string,
      {
        topic: string;
        frequency: number;
        totalMarks: number;
        years: Set<number>;
        units: Set<number>;
        sampleQuestions: string[];
      }
    > = {};

    for (const q of allQuestions) {
      const topic = q.topic || "General";
      if (!topicStats[topic]) {
        topicStats[topic] = {
          topic,
          frequency: 0,
          totalMarks: 0,
          years: new Set(),
          units: new Set(),
          sampleQuestions: [],
        };
      }
      topicStats[topic].frequency += 1;
      topicStats[topic].totalMarks += q.marks || 5;
      topicStats[topic].years.add(q.year);
      if (q.unit) topicStats[topic].units.add(q.unit);
      if (topicStats[topic].sampleQuestions.length < 3) {
        topicStats[topic].sampleQuestions.push(q.text);
      }
    }

    // Convert to sorted list and calculate priority scores
    const currentYear = new Date().getFullYear();
    const rankedTopics = Object.values(topicStats).map((stat) => {
      const yearArray = Array.from(stat.years).sort((a, b) => b - a);
      const isRecent = yearArray.some((y) => currentYear - y <= 2);
      
      // Priority Score formula: (frequency * 3) + (totalMarks * 0.5) + (isRecent ? 4 : 0) + (yearArray.length * 2)
      const priorityScore =
        stat.frequency * 3 + stat.totalMarks * 0.5 + (isRecent ? 4 : 0) + yearArray.length * 2;

      let priorityTier: "HIGH" | "MEDIUM" | "LOW" = "LOW";
      if (priorityScore >= 12 || stat.frequency >= 2) {
        priorityTier = "HIGH";
      } else if (priorityScore >= 6) {
        priorityTier = "MEDIUM";
      }

      const yearsStr = yearArray.join(", ");
      const explanation = `Asked ${stat.frequency} time(s) across years [${yearsStr}] with total weightage of ${stat.totalMarks} marks.`;

      return {
        topic: stat.topic,
        frequency: stat.frequency,
        totalMarks: stat.totalMarks,
        years: yearArray,
        units: Array.from(stat.units).sort(),
        priorityScore,
        priorityTier,
        explanation,
        sampleQuestions: stat.sampleQuestions,
      };
    });

    rankedTopics.sort((a, b) => b.priorityScore - a.priorityScore);

    // Group by Priority Tier
    const highPriority = rankedTopics.filter((t) => t.priorityTier === "HIGH");
    const mediumPriority = rankedTopics.filter((t) => t.priorityTier === "MEDIUM");
    const lowPriority = rankedTopics.filter((t) => t.priorityTier === "LOW");

    // Unit-wise distribution
    const unitDistribution: Record<number, { unit: number; questionCount: number; totalMarks: number }> = {};
    for (let u = 1; u <= 5; u++) {
      unitDistribution[u] = { unit: u, questionCount: 0, totalMarks: 0 };
    }

    for (const q of allQuestions) {
      const u = q.unit || 1;
      if (!unitDistribution[u]) {
        unitDistribution[u] = { unit: u, questionCount: 0, totalMarks: 0 };
      }
      unitDistribution[u].questionCount += 1;
      unitDistribution[u].totalMarks += q.marks || 5;
    }

    return NextResponse.json({
      subject: {
        code: subject.code,
        name: subject.name,
        branch: subject.branch.code,
        semester: subject.semester,
        regulation: subject.regulation,
      },
      totalPapersAnalyzed: totalPapers,
      totalQuestionsAnalyzed: allQuestions.length,
      priorityBreakdown: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority,
      },
      unitDistribution: Object.values(unitDistribution),
      allTopics: rankedTopics,
    });
  } catch (error) {
    console.error("Error generating analysis:", error);
    return NextResponse.json({ error: "Failed to generate PYQ analysis." }, { status: 500 });
  }
}
