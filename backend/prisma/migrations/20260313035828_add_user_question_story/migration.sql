-- CreateTable
CREATE TABLE "UserQuestionStory" (
    "id" TEXT NOT NULL,
    "userQuestionId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserQuestionStory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserQuestionStory" ADD CONSTRAINT "UserQuestionStory_userQuestionId_fkey" FOREIGN KEY ("userQuestionId") REFERENCES "UserQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionStory" ADD CONSTRAINT "UserQuestionStory_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
