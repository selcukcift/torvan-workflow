-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "projectName" TEXT,
    "deliveryDate" DATETIME NOT NULL,
    "salesRep" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "totalQuantity" INTEGER NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'EN',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_configurations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "buildNumber" TEXT NOT NULL,
    "sinkFamily" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sinkModel" TEXT,
    "sinkWidth" INTEGER,
    "sinkLength" INTEGER,
    "legType" TEXT,
    "legHeightType" TEXT,
    "feetType" TEXT,
    "workflowDirection" TEXT,
    "hasPegboard" BOOLEAN NOT NULL DEFAULT false,
    "pegboardType" TEXT,
    "pegboardColor" TEXT,
    "pegboardSize" TEXT,
    "pegboardWidth" INTEGER,
    "pegboardLength" INTEGER,
    "basins" JSONB,
    "faucets" JSONB,
    "accessories" JSONB,
    CONSTRAINT "order_configurations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documents_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "subcategories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subcategoryCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assemblies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assemblyCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "canOrder" BOOLEAN NOT NULL DEFAULT true,
    "isKit" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "imageUrl" TEXT,
    "drawingUrl" TEXT,
    "qrCode" TEXT,
    CONSTRAINT "assemblies_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "assemblies_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturerPartNumber" TEXT,
    "manufacturerInfo" TEXT,
    "type" TEXT NOT NULL DEFAULT 'COMPONENT',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE'
);

-- CreateTable
CREATE TABLE "assembly_components" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assemblyId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "assembly_components_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "assemblies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "assembly_components_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bom_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "assemblyId" TEXT,
    "quantity" INTEGER NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "procured" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "bom_entries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bom_entries_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "assemblies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "work_instructions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "toolsNeeded" JSONB,
    "safetyNotes" TEXT
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "estimatedHours" REAL,
    "actualHours" REAL,
    "assignedToId" TEXT,
    "workInstructionId" TEXT,
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tasks_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_workInstructionId_fkey" FOREIGN KEY ("workInstructionId") REFERENCES "work_instructions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "qc_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "checklist" JSONB NOT NULL,
    "notes" TEXT,
    "inspectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qc_records_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "qc_records_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "orders_poNumber_key" ON "orders"("poNumber");

-- CreateIndex
CREATE UNIQUE INDEX "order_configurations_buildNumber_key" ON "order_configurations"("buildNumber");

-- CreateIndex
CREATE UNIQUE INDEX "categories_categoryCode_key" ON "categories"("categoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_subcategoryCode_key" ON "subcategories"("subcategoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "assemblies_assemblyCode_key" ON "assemblies"("assemblyCode");

-- CreateIndex
CREATE UNIQUE INDEX "parts_partNumber_key" ON "parts"("partNumber");

-- CreateIndex
CREATE UNIQUE INDEX "assembly_components_assemblyId_partId_key" ON "assembly_components"("assemblyId", "partId");

-- CreateIndex
CREATE UNIQUE INDEX "tools_name_key" ON "tools"("name");
