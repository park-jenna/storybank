-- Refactor: Remove catalog Question, UserQuestion, UserQuestionStory.
-- Add user-owned Question (content, recommendedCategories) and QuestionStory.

-- Drop in order: dependents first (QuestionStory may exist from a partial previous run)
DROP TABLE IF EXISTS "QuestionStory";
DROP TABLE IF EXISTS "UserQuestionStory";
DROP TABLE IF EXISTS "UserQuestion";
DROP TABLE IF EXISTS "Question";

-- CreateTable: Question (user's saved question)
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "recommendedCategories" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable: QuestionStory (question <-> story link)
CREATE TABLE "QuestionStory" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionStory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey Question -> User
ALTER TABLE "Question" ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey QuestionStory -> Question
ALTER TABLE "QuestionStory" ADD CONSTRAINT "QuestionStory_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey QuestionStory -> Story
ALTER TABLE "QuestionStory" ADD CONSTRAINT "QuestionStory_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
