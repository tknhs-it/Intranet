BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [casesId] NVARCHAR(1000),
    [email] NVARCHAR(1000) NOT NULL,
    [firstName] NVARCHAR(1000) NOT NULL,
    [lastName] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [department] NVARCHAR(1000),
    [position] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_casesId_key] UNIQUE NONCLUSTERED ([casesId]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Student] (
    [id] NVARCHAR(1000) NOT NULL,
    [cases_id] NVARCHAR(1000) NOT NULL,
    [first_name] NVARCHAR(1000) NOT NULL,
    [last_name] NVARCHAR(1000) NOT NULL,
    [date_of_birth] DATETIME2,
    [sex] NVARCHAR(1000),
    [year_level] INT,
    [home_group] NVARCHAR(1000),
    [house] NVARCHAR(1000),
    [email] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [active] BIT NOT NULL CONSTRAINT [Student_active_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Student_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Student_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Student_cases_id_key] UNIQUE NONCLUSTERED ([cases_id])
);

-- CreateTable
CREATE TABLE [dbo].[Dashboard] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [widgets] NVARCHAR(max) NOT NULL CONSTRAINT [Dashboard_widgets_df] DEFAULT '{}',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Dashboard_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Dashboard_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Dashboard_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[Room] (
    [id] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [building] NVARCHAR(1000) NOT NULL,
    [floor] INT,
    [capacity] INT,
    [type] NVARCHAR(1000) NOT NULL,
    [equipment] NVARCHAR(max) NOT NULL CONSTRAINT [Room_equipment_df] DEFAULT '[]',
    [compassRoomId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Room_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Room_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Room_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[RoomBooking] (
    [id] NVARCHAR(1000) NOT NULL,
    [roomId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [startTime] DATETIME2 NOT NULL,
    [endTime] DATETIME2 NOT NULL,
    [purpose] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RoomBooking_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [RoomBooking_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RoomTimetable] (
    [id] NVARCHAR(1000) NOT NULL,
    [roomId] NVARCHAR(1000) NOT NULL,
    [period] INT NOT NULL,
    [day] INT NOT NULL,
    [className] NVARCHAR(1000),
    [teacherId] NVARCHAR(1000),
    [compassClassId] NVARCHAR(1000),
    [term] INT NOT NULL,
    [year] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RoomTimetable_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [RoomTimetable_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RoomTimetable_roomId_period_day_term_year_key] UNIQUE NONCLUSTERED ([roomId],[period],[day],[term],[year])
);

-- CreateTable
CREATE TABLE [dbo].[Announcement] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [authorId] NVARCHAR(1000) NOT NULL,
    [tags] NVARCHAR(max) NOT NULL CONSTRAINT [Announcement_tags_df] DEFAULT '[]',
    [priority] NVARCHAR(1000) NOT NULL CONSTRAINT [Announcement_priority_df] DEFAULT 'NORMAL',
    [isPinned] BIT NOT NULL CONSTRAINT [Announcement_isPinned_df] DEFAULT 0,
    [expiresAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Announcement_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Announcement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AnnouncementComment] (
    [id] NVARCHAR(1000) NOT NULL,
    [announcementId] NVARCHAR(1000) NOT NULL,
    [authorId] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AnnouncementComment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [AnnouncementComment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[HelpdeskTicket] (
    [id] NVARCHAR(1000) NOT NULL,
    [ticketNumber] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [HelpdeskTicket_status_df] DEFAULT 'OPEN',
    [priority] NVARCHAR(1000) NOT NULL CONSTRAINT [HelpdeskTicket_priority_df] DEFAULT 'NORMAL',
    [location] NVARCHAR(1000),
    [photos] NVARCHAR(max) NOT NULL CONSTRAINT [HelpdeskTicket_photos_df] DEFAULT '[]',
    [assignedTo] NVARCHAR(1000),
    [resolvedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [HelpdeskTicket_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [HelpdeskTicket_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [HelpdeskTicket_ticketNumber_key] UNIQUE NONCLUSTERED ([ticketNumber])
);

-- CreateTable
CREATE TABLE [dbo].[TicketUpdate] (
    [id] NVARCHAR(1000) NOT NULL,
    [ticketId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TicketUpdate_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [TicketUpdate_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Resource] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max),
    [type] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [tags] NVARCHAR(max) NOT NULL CONSTRAINT [Resource_tags_df] DEFAULT '[]',
    [fileUrl] NVARCHAR(1000),
    [externalUrl] NVARCHAR(1000),
    [authorId] NVARCHAR(1000) NOT NULL,
    [isPublic] BIT NOT NULL CONSTRAINT [Resource_isPublic_df] DEFAULT 1,
    [downloadCount] INT NOT NULL CONSTRAINT [Resource_downloadCount_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Resource_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Resource_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Form] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max),
    [category] NVARCHAR(1000) NOT NULL,
    [schema] NVARCHAR(max) NOT NULL,
    [workflow] NVARCHAR(max),
    [isActive] BIT NOT NULL CONSTRAINT [Form_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Form_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Form_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[FormSubmission] (
    [id] NVARCHAR(1000) NOT NULL,
    [formId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [data] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [FormSubmission_status_df] DEFAULT 'PENDING',
    [currentStep] INT NOT NULL CONSTRAINT [FormSubmission_currentStep_df] DEFAULT 0,
    [approvers] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FormSubmission_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [FormSubmission_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PDRecord] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max),
    [provider] NVARCHAR(1000),
    [hours] FLOAT(53) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [category] NVARCHAR(1000),
    [evidenceUrl] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [PDRecord_status_df] DEFAULT 'PENDING',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PDRecord_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PDRecord_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Task] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max),
    [source] NVARCHAR(1000) NOT NULL,
    [sourceId] NVARCHAR(1000),
    [dueDate] DATETIME2,
    [completed] BIT NOT NULL CONSTRAINT [Task_completed_df] DEFAULT 0,
    [priority] NVARCHAR(1000) NOT NULL CONSTRAINT [Task_priority_df] DEFAULT 'NORMAL',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Task_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Task_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AnalyticsEvent] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000),
    [eventType] NVARCHAR(1000) NOT NULL,
    [eventData] NVARCHAR(max),
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [AnalyticsEvent_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AnalyticsEvent_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [User_email_idx] ON [dbo].[User]([email]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [User_casesId_idx] ON [dbo].[User]([casesId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [User_role_idx] ON [dbo].[User]([role]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Student_cases_id_idx] ON [dbo].[Student]([cases_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Student_year_level_idx] ON [dbo].[Student]([year_level]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Student_home_group_idx] ON [dbo].[Student]([home_group]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Room_code_idx] ON [dbo].[Room]([code]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Room_building_idx] ON [dbo].[Room]([building]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Room_type_idx] ON [dbo].[Room]([type]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [RoomBooking_roomId_startTime_endTime_idx] ON [dbo].[RoomBooking]([roomId], [startTime], [endTime]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [RoomTimetable_roomId_term_year_idx] ON [dbo].[RoomTimetable]([roomId], [term], [year]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Announcement_isPinned_createdAt_idx] ON [dbo].[Announcement]([isPinned], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Announcement_priority_idx] ON [dbo].[Announcement]([priority]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [HelpdeskTicket_status_createdAt_idx] ON [dbo].[HelpdeskTicket]([status], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [HelpdeskTicket_type_status_idx] ON [dbo].[HelpdeskTicket]([type], [status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [HelpdeskTicket_userId_idx] ON [dbo].[HelpdeskTicket]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Resource_type_category_idx] ON [dbo].[Resource]([type], [category]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Form_category_isActive_idx] ON [dbo].[Form]([category], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [FormSubmission_formId_status_idx] ON [dbo].[FormSubmission]([formId], [status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [FormSubmission_userId_idx] ON [dbo].[FormSubmission]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PDRecord_userId_date_idx] ON [dbo].[PDRecord]([userId], [date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Task_userId_completed_dueDate_idx] ON [dbo].[Task]([userId], [completed], [dueDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AnalyticsEvent_eventType_timestamp_idx] ON [dbo].[AnalyticsEvent]([eventType], [timestamp]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AnalyticsEvent_userId_timestamp_idx] ON [dbo].[AnalyticsEvent]([userId], [timestamp]);

-- AddForeignKey
ALTER TABLE [dbo].[Dashboard] ADD CONSTRAINT [Dashboard_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RoomBooking] ADD CONSTRAINT [RoomBooking_roomId_fkey] FOREIGN KEY ([roomId]) REFERENCES [dbo].[Room]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RoomBooking] ADD CONSTRAINT [RoomBooking_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RoomTimetable] ADD CONSTRAINT [RoomTimetable_roomId_fkey] FOREIGN KEY ([roomId]) REFERENCES [dbo].[Room]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Announcement] ADD CONSTRAINT [Announcement_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AnnouncementComment] ADD CONSTRAINT [AnnouncementComment_announcementId_fkey] FOREIGN KEY ([announcementId]) REFERENCES [dbo].[Announcement]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[HelpdeskTicket] ADD CONSTRAINT [HelpdeskTicket_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TicketUpdate] ADD CONSTRAINT [TicketUpdate_ticketId_fkey] FOREIGN KEY ([ticketId]) REFERENCES [dbo].[HelpdeskTicket]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FormSubmission] ADD CONSTRAINT [FormSubmission_formId_fkey] FOREIGN KEY ([formId]) REFERENCES [dbo].[Form]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FormSubmission] ADD CONSTRAINT [FormSubmission_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PDRecord] ADD CONSTRAINT [PDRecord_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [Task_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
