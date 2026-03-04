/**
 * JobStatus
 * Represents the four statuses of
 * jobs in this program. 
 * erasableSyntaxOnly has been turned off to support
 * this enum. See tsconfif.app.json. 
 * This being turned off means that this enum
 * is not compatible with vanilla js.
 * see: https://devblogs.microsoft.com/typescript/announcing-typescript-5-8-beta/#the---erasablesyntaxonly-option
 *  */ 
export enum JobStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    MISSING = "missing",
}