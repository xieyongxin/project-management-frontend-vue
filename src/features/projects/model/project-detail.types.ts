export type {
  ActivityEventDto as ProjectActivityEvent,
  DevRecordCreateRequest as DevRecordCreatePayload,
  PhaseDto as ProjectPhase,
  ProjectConfigurationSnapshotDto as ProjectConfigurationSnapshot,
  ProjectMemberDto as ProjectMember,
  ProjectMemberSaveRequest as ProjectMemberSavePayload,
  ReleaseRequest as ReleasePayload,
  SprintDto as ProjectSprint,
  SprintSaveRequest as SprintSavePayload,
  TestExecutionBoardDto as TestExecutionBoard,
  TestPlanDto as ProjectTestPlan,
  TestRunDefectRequest as TestRunDefectPayload,
  TestRunDetailDto as TestRunDetail,
  TestRunDto as ProjectTestRun,
  TestRunStepDto as TestRunStep,
  VersionDto as ProjectVersion,
  VersionSaveRequest as VersionSavePayload,
  WorkItemCommentCreateRequest as WorkItemCommentCreatePayload,
  WorkItemCreateRequest as WorkItemCreatePayload,
  WorkItemDto as WorkItem,
  WorkItemListResponse as WorkItemList,
  WorkItemSummaryDto as WorkItemSummary,
  WorkItemTransitionRequest as WorkItemTransitionPayload,
  WorkItemUpdateRequest as WorkItemUpdatePayload,
  WorkflowDto as ProjectWorkflow,
} from '@/shared/api/generated/models'

export type ProjectDetailSection =
  | 'overview'
  | 'requirements'
  | 'tasks'
  | 'defects'
  | 'sprints'
  | 'phases'
  | 'versions'
  | 'tests'
  | 'members'
  | 'activity'
  | 'configuration'

export type WorkItemKind = 'requirements' | 'tasks' | 'defects'
