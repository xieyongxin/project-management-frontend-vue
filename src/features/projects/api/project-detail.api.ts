import {
  createDevRecord,
  createOrLinkRunDefect,
  createRequirementAcceptance,
  createSprint,
  createVersion,
  createWorkItem,
  createWorkItemComment,
  getProjectActivity,
  getProjectConfiguration,
  getProjectDefects,
  getProjectMembers,
  getProjectPhases,
  getProjectRequirements,
  getProjectSprints,
  getProjectTasks,
  getProjectTestExecutionBoard,
  getProjectTestRun,
  getProjectVersions,
  getUsers,
  getWorkItem,
  releaseVersion,
  removeProjectMember,
  saveProjectMember,
  transitionWorkItem,
  updatePhase,
  updateTestRunStep,
  updateWorkItem,
} from '@/shared/api/generated/auth-api'
import type {
  DevRecordCreateRequest,
  PhaseUpdateRequest,
  ProjectMemberSaveRequest,
  RequirementAcceptanceRequest,
  ReleaseRequest,
  SprintSaveRequest,
  TestRunDefectRequest,
  TestRunStepUpdateRequest,
  VersionSaveRequest,
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
  phases: getProjectPhases,
  versions: getProjectVersions,
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

  updatePhase(id: string, payload: PhaseUpdateRequest) {
    return updatePhase(id, payload)
  },

  createVersion(projectId: string, payload: VersionSaveRequest) {
    return createVersion(projectId, payload)
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
