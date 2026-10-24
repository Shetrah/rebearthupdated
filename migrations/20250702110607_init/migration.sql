-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "isBot" BOOLEAN NOT NULL,
    "timestamp" DATETIME NOT NULL
);
