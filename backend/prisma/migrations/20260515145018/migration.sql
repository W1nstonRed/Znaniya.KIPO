/*
  Warnings:

  - You are about to drop the `ScheduleFavorite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleTeacher` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sourceAttemptId]` on the table `Grade` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[normalizedName]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalLessonId,groupId]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[normalizedFullName,groupId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[normalizedFullName]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `normalizedName` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `ScheduleCache` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `ScheduleChange` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Specialty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `normalizedFullName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `normalizedFullName` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ScheduleEntityType" AS ENUM ('GROUP', 'TEACHER');

-- CreateEnum
CREATE TYPE "FileVisibility" AS ENUM ('PRIVATE', 'SHARED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "TestQuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT');

-- CreateEnum
CREATE TYPE "TestAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'GRADED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ProctorEventType" AS ENUM ('PAGE_HIDDEN', 'PAGE_VISIBLE', 'WINDOW_BLUR', 'WINDOW_FOCUS', 'FULLSCREEN_EXIT', 'COPY', 'PASTE', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_studentId_fkey";

-- DropForeignKey
ALTER TABLE "GradeComment" DROP CONSTRAINT "GradeComment_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "GradeComment" DROP CONSTRAINT "GradeComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_specialtyId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleFavorite" DROP CONSTRAINT "ScheduleFavorite_scheduleGroupId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleFavorite" DROP CONSTRAINT "ScheduleFavorite_scheduleTeacherId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleFavorite" DROP CONSTRAINT "ScheduleFavorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleGroup" DROP CONSTRAINT "ScheduleGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleTeacher" DROP CONSTRAINT "ScheduleTeacher_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_groupId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherSubject" DROP CONSTRAINT "TeacherSubject_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherSubject" DROP CONSTRAINT "TeacherSubject_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "UserFavoriteGroup" DROP CONSTRAINT "UserFavoriteGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "UserFavoriteGroup" DROP CONSTRAINT "UserFavoriteGroup_userId_fkey";

-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "sourceAttemptId" TEXT;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "normalizedName" TEXT NOT NULL,
ALTER COLUMN "specialtyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "building" TEXT,
ADD COLUMN     "cabinetId" TEXT,
ADD COLUMN     "cabinetName" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "externalLessonId" TEXT,
ADD COLUMN     "lessonNumber" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lessonPlanTopicId" TEXT,
ADD COLUMN     "startTime" TEXT,
ADD COLUMN     "topic" TEXT,
ADD COLUMN     "typeLesson" TEXT,
ALTER COLUMN "subjectId" DROP NOT NULL,
ALTER COLUMN "teacherId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ScheduleCache" DROP COLUMN "type",
ADD COLUMN     "type" "ScheduleEntityType" NOT NULL;

-- AlterTable
ALTER TABLE "ScheduleChange" DROP COLUMN "type",
ADD COLUMN     "type" "ScheduleEntityType" NOT NULL;

-- AlterTable
ALTER TABLE "Specialty" ADD COLUMN     "animationUrl" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "iconName" SET DEFAULT 'graduation-cap';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "normalizedFullName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "normalizedFullName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayName" TEXT;

-- DropTable
DROP TABLE "ScheduleFavorite";

-- DropTable
DROP TABLE "ScheduleGroup";

-- DropTable
DROP TABLE "ScheduleTeacher";

-- CreateTable
CREATE TABLE "LessonTeacher" (
    "lessonId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "externalTeacherId" INTEGER,

    CONSTRAINT "LessonTeacher_pkey" PRIMARY KEY ("lessonId","teacherId")
);

-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "groupId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "fileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonPlanTopic" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "lessonPlanId" TEXT NOT NULL,

    CONSTRAINT "LessonPlanTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleGroupExternal" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleGroupExternal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleTeacherExternal" (
    "id" INTEGER NOT NULL,
    "fio" TEXT NOT NULL,
    "normalizedFio" TEXT NOT NULL,
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleTeacherExternal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleFavoriteGroup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "externalGroupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleFavoriteGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleFavoriteTeacher" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "externalTeacherId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleFavoriteTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileAsset" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "visibility" "FileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "lessonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileShare" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "targetGroupId" TEXT,
    "canDownload" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "creatorId" TEXT NOT NULL,
    "subjectId" TEXT,
    "deadline" TIMESTAMP(3),
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "isGrade" BOOLEAN NOT NULL DEFAULT false,
    "gradeLessonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestAssignment" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestQuestion" (
    "id" TEXT NOT NULL,
    "type" "TestQuestionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "textAnswer" TEXT,
    "minMatchPercent" INTEGER NOT NULL DEFAULT 80,
    "testId" TEXT NOT NULL,

    CONSTRAINT "TestQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestOption" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "TestOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestAttempt" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "studentId" TEXT,
    "userId" TEXT,
    "status" "TestAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "scorePercent" DOUBLE PRECISION,
    "scorePoints" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),

    CONSTRAINT "TestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestAttemptAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionIds" JSONB,
    "textAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "scorePoints" DOUBLE PRECISION,
    "similarityPercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestAttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestProctorEvent" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "type" "ProctorEventType" NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestProctorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonPlan_fileId_key" ON "LessonPlan"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonPlanTopic_lessonPlanId_order_key" ON "LessonPlanTopic"("lessonPlanId", "order");

-- CreateIndex
CREATE INDEX "ScheduleGroupExternal_groupId_idx" ON "ScheduleGroupExternal"("groupId");

-- CreateIndex
CREATE INDEX "ScheduleGroupExternal_normalizedName_idx" ON "ScheduleGroupExternal"("normalizedName");

-- CreateIndex
CREATE INDEX "ScheduleTeacherExternal_teacherId_idx" ON "ScheduleTeacherExternal"("teacherId");

-- CreateIndex
CREATE INDEX "ScheduleTeacherExternal_normalizedFio_idx" ON "ScheduleTeacherExternal"("normalizedFio");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleFavoriteGroup_userId_externalGroupId_key" ON "ScheduleFavoriteGroup"("userId", "externalGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleFavoriteTeacher_userId_externalTeacherId_key" ON "ScheduleFavoriteTeacher"("userId", "externalTeacherId");

-- CreateIndex
CREATE INDEX "FileAsset_ownerId_idx" ON "FileAsset"("ownerId");

-- CreateIndex
CREATE INDEX "FileShare_targetUserId_idx" ON "FileShare"("targetUserId");

-- CreateIndex
CREATE INDEX "FileShare_targetGroupId_idx" ON "FileShare"("targetGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "TestAssignment_testId_groupId_key" ON "TestAssignment"("testId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "TestQuestion_testId_order_key" ON "TestQuestion"("testId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "TestOption_questionId_order_key" ON "TestOption"("questionId", "order");

-- CreateIndex
CREATE INDEX "TestAttempt_testId_studentId_idx" ON "TestAttempt"("testId", "studentId");

-- CreateIndex
CREATE INDEX "TestAttempt_userId_idx" ON "TestAttempt"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TestAttemptAnswer_attemptId_questionId_key" ON "TestAttemptAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "TestProctorEvent_attemptId_createdAt_idx" ON "TestProctorEvent"("attemptId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_sourceAttemptId_key" ON "Grade"("sourceAttemptId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_normalizedName_key" ON "Group"("normalizedName");

-- CreateIndex
CREATE INDEX "Lesson_groupId_date_idx" ON "Lesson"("groupId", "date");

-- CreateIndex
CREATE INDEX "Lesson_teacherId_date_idx" ON "Lesson"("teacherId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_externalLessonId_groupId_key" ON "Lesson"("externalLessonId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleCache_type_externalId_weekStart_key" ON "ScheduleCache"("type", "externalId", "weekStart");

-- CreateIndex
CREATE INDEX "Student_groupId_idx" ON "Student"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_normalizedFullName_groupId_key" ON "Student"("normalizedFullName", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_normalizedFullName_key" ON "Teacher"("normalizedFullName");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "Cabinet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_lessonPlanTopicId_fkey" FOREIGN KEY ("lessonPlanTopicId") REFERENCES "LessonPlanTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonTeacher" ADD CONSTRAINT "LessonTeacher_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonTeacher" ADD CONSTRAINT "LessonTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlanTopic" ADD CONSTRAINT "LessonPlanTopic_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_sourceAttemptId_fkey" FOREIGN KEY ("sourceAttemptId") REFERENCES "TestAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeComment" ADD CONSTRAINT "GradeComment_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeComment" ADD CONSTRAINT "GradeComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteGroup" ADD CONSTRAINT "UserFavoriteGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteGroup" ADD CONSTRAINT "UserFavoriteGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleGroupExternal" ADD CONSTRAINT "ScheduleGroupExternal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleTeacherExternal" ADD CONSTRAINT "ScheduleTeacherExternal_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleFavoriteGroup" ADD CONSTRAINT "ScheduleFavoriteGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleFavoriteGroup" ADD CONSTRAINT "ScheduleFavoriteGroup_externalGroupId_fkey" FOREIGN KEY ("externalGroupId") REFERENCES "ScheduleGroupExternal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleFavoriteTeacher" ADD CONSTRAINT "ScheduleFavoriteTeacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleFavoriteTeacher" ADD CONSTRAINT "ScheduleFavoriteTeacher_externalTeacherId_fkey" FOREIGN KEY ("externalTeacherId") REFERENCES "ScheduleTeacherExternal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_targetGroupId_fkey" FOREIGN KEY ("targetGroupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_gradeLessonId_fkey" FOREIGN KEY ("gradeLessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAssignment" ADD CONSTRAINT "TestAssignment_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAssignment" ADD CONSTRAINT "TestAssignment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestOption" ADD CONSTRAINT "TestOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TestQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttemptAnswer" ADD CONSTRAINT "TestAttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TestAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttemptAnswer" ADD CONSTRAINT "TestAttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TestQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestProctorEvent" ADD CONSTRAINT "TestProctorEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TestAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
