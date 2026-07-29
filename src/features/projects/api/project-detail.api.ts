import {
  addVersionScope,
  createDevRecord,
  createOrLinkRunDefect,
  createRequirementAcceptance,
  createSprint,
  createSprintCategory,
  createVersion,
  createWorkItem,
  createWorkItemComment,
  completeSprint,
  getProjectActivity,
  getProjectConfiguration,
  getProjectDefects,
  getProjectMembers,
  getProjectPhases,
  getProjectRequirements,
  getProjectSprintCategories,
  getProjectSprints,
  getProjectTasks,
  getProjectTestExecutionBoard,
  getProjectTestRun,
  getProjectVersionStages,
  getProjectVersions,
  getSprint,
  getUsers,
  getVersion,
  getWorkItem,
  releaseVersion,
  reopenSprint,
  removeProjectMember,
  saveProjectMember,
  startSprint,
  transitionWorkItem,
  updatePhase,
  updateSprint,
  updateTestRunStep,
  updateVersion,
  updateWorkItem,
} from '@/shared/api/generated/auth-api'
import type {
  DevRecordCreateRequest,
  PhaseUpdateRequest,
  ProjectMemberSaveRequest,
  RequirementAcceptanceRequest,
  ReleaseRequest,
  SprintCategorySaveRequest,
  SprintSaveRequest,
  SprintTransitionRequest,
  TestRunDefectRequest,
  TestRunStepUpdateRequest,
  VersionSaveRequest,
  VersionScopeRequest,
  WorkItemCommentCreateRequest,
  WorkItemCreateRequest,
  WorkItemTransitionRequest,
  WorkItemUpdateRequest,
} from '@/shared/api/generated/models'
import type { WorkItemKind } from '../model/project-detail.types'

export interface WorkItemListParams {
  keyword?: string
  status?: string
  page?: number
  page_size?: number
}

export const projectDetailApi = {
  activity: getProjectActivity,
  configuration: getProjectConfiguration,
  members: getProjectMembers,
  sprints: getProjectSprints,
  sprintCategories: getProjectSprintCategories,
  sprint: getSprint,
  phases: getProjectPhases,
  versions: getProjectVersions,
  versionStages: getProjectVersionStages,
  version: getVersion,
  testBoard: getProjectTestExecutionBoard,
  testRun: getProjectTestRun,
  workItem: getWorkItem,
  users: getUsers,

  workItems(projectId: string, kind: WorkItemKind, params: WorkItemListParams) {
    if (kind === 'tasks') {
      return getProjectTasks(projectId, params)
    }
    if (kind === 'defects') {
      return getProjectDefects(projectId, params)
    }
    return getProjectRequirements(projectId, params)
  },

  createWorkItem(payload: WorkItemCreateRequest) {
    return createWorkItem(payload)
  },

  updateWorkItem(id: string, payload: WorkItemUpdateRequest) {
    return updateWorkItem(id, payload)
  },

  transitionWorkItem(id: string, payload: WorkItemTransitionRequest) {
    return transitionWorkItem(id, payload)
  },

  createRequirementAcceptance(
    id: string,
    payload: RequirementAcceptanceRequest,
  ) {
    return createRequirementAcceptance(id, payload)
  },

  createWorkItemComment(id: string, payload: WorkItemCommentCreateRequest) {
    return createWorkItemComment(id, payload)
  },

  createDevRecord(id: string, payload: DevRecordCreateRequest) {
    return createDevRecord(id, payload)
  },

  createSprint(projectId: string, payload: SprintSaveRequest) {
    return createSprint(projectId, payload)
  },

  createSprintCategory(projectId: string, payload: SprintCategorySaveRequest) {
    return createSprintCategory(projectId, payload)
  },

  updateSprint(id: string, payload: SprintSaveRequest) {
    return updateSprint(id, payload)
  },

  startSprint(id: string, payload: SprintTransitionRequest) {
    return startSprint(id, payload)
  },

  completeSprint(id: string, payload: SprintTransitionRequest) {
    return completeSprint(id, payload)
  },

  reopenSprint(id: string, payload: SprintTransitionRequest) {
    return reopenSprint(id, payload)
  },

  updatePhase(id: string, payload: PhaseUpdateRequest) {
    return updatePhase(id, payload)
  },

  createVersion(projectId: string, payload: VersionSaveRequest) {
    return createVersion(projectId, payload)
  },

  updateVersion(id: string, payload: VersionSaveRequest) {
    return updateVersion(id, payload)
  },

  addVersionScope(id: string, payload: VersionScopeRequest) {
    return addVersionScope(id, payload)
  },

  releaseVersion(id: string, payload: ReleaseRequest) {
    return releaseVersion(id, payload)
  },

  updateTestRunStep(
    runId: string,
    stepId: string,
    payload: TestRunStepUpdateRequest,
  ) {
    return updateTestRunStep(runId, stepId, payload)
  },

  createOrLinkRunDefect(runId: string, payload: TestRunDefectRequest) {
    return createOrLinkRunDefect(runId, payload)
  },

  saveProjectMember(projectId: string, payload: ProjectMemberSaveRequest) {
    return saveProjectMember(projectId, payload)
  },

  removeProjectMember(projectId: string, memberId: string) {
    return removeProjectMember(projectId, memberId)
  },
}
