// Validation rules for goals
const validateGoalWeightage = (goals) => {
  const totalWeightage = goals.reduce((sum, goal) => sum + parseFloat(goal.weightage), 0);
  
  if (Math.abs(totalWeightage - 100) > 0.01) {
    return { 
      valid: false, 
      message: `Total weightage must be 100%. Current: ${totalWeightage}%` 
    };
  }

  for (const goal of goals) {
    if (parseFloat(goal.weightage) < 10) {
      return { 
        valid: false, 
        message: `Minimum weightage per goal is 10%. Goal "${goal.title}" has ${goal.weightage}%` 
      };
    }
  }

  return { valid: true };
};

const validateGoalCount = (goals) => {
  if (goals.length > 8) {
    return { 
      valid: false, 
      message: `Maximum 8 goals allowed. Current: ${goals.length}` 
    };
  }
  
  if (goals.length < 1) {
    return { 
      valid: false, 
      message: 'At least 1 goal is required' 
    };
  }

  return { valid: true };
};

const calculateProgressScore = (actual, target, uom) => {
  if (!actual || !target) return null;

  const actualNum = parseFloat(actual);
  const targetNum = parseFloat(target);

  switch (uom) {
    case 'NUMERIC':
    case 'PERCENTAGE':
      // Higher is better
      return Math.min(100, (actualNum / targetNum) * 100);
    
    case 'TIMELINE':
      // Compare dates
      return actualNum <= targetNum ? 100 : (targetNum / actualNum) * 100;
    
    case 'ZERO_BASED':
      // 0 is success (100%), anything else is failure
      return actualNum === 0 ? 100 : 0;
    
    default:
      return null;
  }
};

const getProgressStatus = (progressScore) => {
  if (progressScore === null) return 'NOT_STARTED';
  if (progressScore >= 100) return 'COMPLETED';
  if (progressScore >= 75) return 'ON_TRACK';
  return 'AT_RISK';
};

module.exports = {
  validateGoalWeightage,
  validateGoalCount,
  calculateProgressScore,
  getProgressStatus
};
