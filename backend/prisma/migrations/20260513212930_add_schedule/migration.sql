-- CreateTable
CREATE TABLE "ScheduleGroup" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" TEXT,

    CONSTRAINT "ScheduleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleTeacher" (
    "id" INTEGER NOT NULL,
    "fio" TEXT NOT NULL,
    "teacherId" TEXT,

    CONSTRAINT "ScheduleTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduleGroupId" INTEGER,
    "scheduleTeacherId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleCache" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "hash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleChange" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "diff" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cabinet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "building" TEXT,
    "floor" INTEGER,
    "ignore" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cabinet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleGroup_groupId_key" ON "ScheduleGroup"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleTeacher_teacherId_key" ON "ScheduleTeacher"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleFavorite_userId_scheduleGroupId_key" ON "ScheduleFavorite"("userId", "scheduleGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleFavorite_userId_scheduleTeacherId_key" ON "ScheduleFavorite"("userId", "scheduleTeacherId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleCache_type_externalId_weekStart_key" ON "ScheduleCache"("type", "externalId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "Cabinet_name_key" ON "Cabinet"("name");

-- AddForeignKey
ALTER TABLE "ScheduleGroup" ADD CONSTRAINT "ScheduleGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleTeacher" ADD CONSTRAINT "ScheduleTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleFavorite" ADD CONSTRAINT "ScheduleFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleFavorite" ADD CONSTRAINT "ScheduleFavorite_scheduleGroupId_fkey" FOREIGN KEY ("scheduleGroupId") REFERENCES "ScheduleGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleFavorite" ADD CONSTRAINT "ScheduleFavorite_scheduleTeacherId_fkey" FOREIGN KEY ("scheduleTeacherId") REFERENCES "ScheduleTeacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
