import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  submitBatch,
  pollBatchResults,
} from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testCases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      error: "Forbidden: You do not have permission to create a problem.",
    });
  }

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res.status(400).json({
          success: false,
          error: `Invalid language: ${language}. Supported languages are Python, JavaScript, and Java.`,
        });
      }

      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            success: false,
            error: `Testcase ${i + 1} failed for language ${language}.`,
          });
        }
      }
    }

    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testCases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Problem created successfully.",
      problem: newProblem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error:
        "Internal Server Error: Failed to process reference solutions." +
        error.message,
    });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany();

    if (!problems || problems.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "No problems found." });
    }

    res.status(200).json({
      success: true,
      message: "Problems fetched successfully.",
      problems: problems,
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error: Failed to fetch problems.",
    });
  }
};

export const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    const problems = await db.problem.findUnique({
      where: {
        id: id,
      },
    });

    if (!problems) {
      return res
        .status(404)
        .json({ success: false, error: "Problem not found." });
    }

    res.status(200).json({
      success: true,
      message: "Problem fetched successfully.",
      problem: problems,
    });
  } catch (error) {
    console.error("Error fetching problem:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error: Failed to fetch problem.",
    });
  }
};

// TODO
export const updateProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testCases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: {
        id: id,
      },
    });

    if (!problem) {
      return res
        .status(404)
        .json({ success: false, error: "Problem not found." });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: "Forbidden: You do not have permission to create a problem.",
      });
    }

    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res.status(400).json({
          success: false,
          error: `Invalid language: ${language}. Supported languages are Python, JavaScript, and Java.`,
        });
      }

      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);
      const tokens = submissionResults.map((res) => res.token);
      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            success: false,
            error: `Testcase ${i + 1} failed for language ${language}.`,
          });
        }
      }
    }
    const updatedProblem = await db.problem.update({
      where: { id },
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testCases,
        codeSnippets,
        referenceSolutions,
        updatedAt: new Date(),
        userId: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Problem updated Successfully",
      problem: updatedProblem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error: Could not update problem",
    });
  }
};

export const deleteProblem = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      error: "Forbidden: You do not have permission to delete a problem.",
    });
  }

  try {
    const problem = await db.problem.findUnique({
      where: {
        id: id,
      },
    });

    if (!problem) {
      return res
        .status(404)
        .json({ success: false, error: "Problem not found." });
    }

    await db.problem.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Problem deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting problem:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error: Failed to delete problem.",
    });
  }
};
