-- CreateTable
CREATE TABLE "login_attempt" (
    "id" TEXT NOT NULL,
    "ip" VARCHAR(64) NOT NULL,
    "email" VARCHAR(255),
    "success" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_attempt_ip_created_at_idx" ON "login_attempt"("ip", "created_at");