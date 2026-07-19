import { describe, expect, it } from 'vitest'
import {
  getDefaultConfigurationState,
  validateProjectTypeConfig,
  validateRoles,
  validateWorkflow,
} from './configuration-center'

describe('configuration-center model', () => {
  it('rejects project type config without enabled business tabs', () => {
    const config = getDefaultConfigurationState().projectTypes[0]

    if (!config) {
      throw new Error('Missing default project type config')
    }

    config.tabs.forEach((tab) => {
      tab.enabled = false
    })

    expect(validateProjectTypeConfig(config).valid).toBe(false)
  })

  it('validates default workflows', () => {
    const state = getDefaultConfigurationState()

    expect(
      state.workflows.every((workflow) => validateWorkflow(workflow).valid),
    ).toBe(true)
  })

  it('rejects non-terminal states without outgoing transitions', () => {
    const workflow = getDefaultConfigurationState().workflows[0]

    if (!workflow) {
      throw new Error('Missing default workflow')
    }

    workflow.transitions = workflow.transitions.filter(
      (transition) => transition.fromStateId !== workflow.states[0]?.id,
    )

    expect(validateWorkflow(workflow).valid).toBe(false)
  })

  it('rejects disabled built-in roles', () => {
    const roles = getDefaultConfigurationState().roles

    roles[0] = { ...roles[0]!, enabled: false }

    expect(validateRoles(roles).valid).toBe(false)
  })
})
