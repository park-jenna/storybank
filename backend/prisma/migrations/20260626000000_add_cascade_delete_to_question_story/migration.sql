-- DropForeignKey
ALTER TABLE "QuestionStory" DROP CONSTRAINT "QuestionStory_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionStory" DROP CONSTRAINT "QuestionStory_storyId_fkey";

-- AddForeignKey with CASCADE
ALTER TABLE "QuestionStory" ADD CONSTRAINT "QuestionStory_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey with CASCADE
ALTER TABLE "QuestionStory" ADD CONSTRAINT "QuestionStory_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
