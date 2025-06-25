import axios from "axios";

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    Python: 71,
    JavaScript: 63,
    Java: 62,
  };
  return languageMap[language.toUpperCase()] || null;
};

export const submitBatch = async (submissions) => {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    { submissions }
  );

  console.log("Batch submission response:", data);
  return data;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
  while (true) {
    const { data } = await axios.get(
      `${process.env.JUDGE0_API_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
        },
      }
    );

    const results = data.submissions;

    const isAllDone = results.every(
      (result) => result.status.id !== 1 && result.status.id !== 2
    );

    if (isAllDone) {
      console.log("All submissions processed:", results);
      return results;
    }

    await sleep(1000);
  }
};
