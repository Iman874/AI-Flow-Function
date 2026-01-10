/**
 * useFlowLogger - Hook untuk integrasi FlowLogger di React components
 * Provides logging methods untuk node dan edge events
 */

import { useEffect, useCallback, useRef } from 'react';
import { flowLogger } from '../utils/log/FlowLogger';

export const useFlowLogger = (componentName) => {
  const loggerRef = useRef(flowLogger);

  // Log component mount
  useEffect(() => {
    console.log(`[${componentName}] Component mounted`);
    return () => {
      console.log(`[${componentName}] Component unmounted`);
    };
  }, [componentName]);

  /**
   * Log node creation
   */
  const logNodeCreated = useCallback((nodeId, nodeType, position, data) => {
    loggerRef.current.logNodeCreated(nodeId, nodeType, position, data);
  }, []);

  /**
   * Log node data changes
   */
  const logNodeDataUpdated = useCallback((nodeId, nodeType, oldData, newData, changeType) => {
    loggerRef.current.logNodeDataUpdated(nodeId, nodeType, oldData, newData, changeType);
  }, []);

  /**
   * Log edge creation
   */
  const logEdgeCreated = useCallback((edgeId, sourceNodeId, targetNodeId, sourceHandle, targetHandle, edgeStyle) => {
    loggerRef.current.logEdgeCreated(edgeId, sourceNodeId, targetNodeId, sourceHandle, targetHandle, edgeStyle);
  }, []);

  /**
   * Log edge style change
   */
  const logEdgeStyleChanged = useCallback((edgeId, oldStyle, newStyle, appliedToAll) => {
    loggerRef.current.logEdgeStyleChanged(edgeId, oldStyle, newStyle, appliedToAll);
  }, []);

  /**
   * Log connection validation
   */
  const logConnectionValidation = useCallback((sourceNodeId, targetNodeId, sourceHandle, targetHandle, isValid, reason) => {
    loggerRef.current.logConnectionValidation(sourceNodeId, targetNodeId, sourceHandle, targetHandle, isValid, reason);
  }, []);

  /**
   * Log variables connected
   */
  const logVariablesConnected = useCallback((nodeId, nodeType, variables) => {
    loggerRef.current.logVariablesConnected(nodeId, nodeType, variables);
  }, []);

  /**
   * Log pseudocode parsing
   */
  const logPseudocodeParsing = useCallback((pseudocode, generatedNodes, generatedEdges) => {
    loggerRef.current.logPseudocodeParsing(pseudocode, generatedNodes, generatedEdges);
  }, []);

  /**
   * Log condition branching
   */
  const logConditionBranching = useCallback((conditionNodeId, condType, branches) => {
    loggerRef.current.logConditionBranching(conditionNodeId, condType, branches);
  }, []);

  /**
   * Log process execution
   */
  const logProcessExecution = useCallback((processNodeId, template, inputVariables, operation) => {
    loggerRef.current.logProcessExecution(processNodeId, template, inputVariables, operation);
  }, []);

  /**
   * Log IO operation
   */
  const logIOOperation = useCallback((nodeId, ioType, variable, operation) => {
    loggerRef.current.logIOOperation(nodeId, ioType, variable, operation);
  }, []);
  
  /**
   * Log UI layout issues (overlaps, collisions)
   */
  const logUILayoutIssue = useCallback((issues) => {
    loggerRef.current.logUILayoutIssue(issues);
  }, []);

  /**
   * Get logger instance
   */
  const getLogger = useCallback(() => loggerRef.current, []);

  return {
    logNodeCreated,
    logNodeDataUpdated,
    logEdgeCreated,
    logEdgeStyleChanged,
    logConnectionValidation,
    logVariablesConnected,
    logPseudocodeParsing,
    logConditionBranching,
    logProcessExecution,
    logIOOperation,
    logUILayoutIssue,
    getLogger
  };
};

export default useFlowLogger;
