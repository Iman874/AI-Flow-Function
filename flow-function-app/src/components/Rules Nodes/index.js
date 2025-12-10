


import namefunctionRule from "./namefunction.rules.js";
import processRule from "./process.rules.js";
import variableRule from "./variable.rules.js";
import conditionRule from "./condition.rules.js";
import ifRule from "./if.rules.js";
import loopRule from "./loop.rules.js";
import returnRule from "./return.rules.js";
import elseRule from "./else.rules.js";
import inputRule from "./input.rules.js";

const rules = [
  namefunctionRule,
  processRule,
  variableRule,
  conditionRule,
  ifRule,
  loopRule,
  returnRule,
  elseRule,
  inputRule,
];

export function validateConnection(params, nodes) {
  for (const rule of rules) {
    if (rule && rule(params, nodes) === false) {
      return false;
    }
  }
  return true;
}

export default rules;
