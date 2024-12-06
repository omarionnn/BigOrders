// Test helper functions for debugging and logging

export const TestLogger = {
  startTest: (testId, description) => {
    console.group(`🧪 TEST: ${testId} - ${description}`);
    console.time(testId);
  },

  endTest: (testId) => {
    console.timeEnd(testId);
    console.groupEnd();
  },

  logStep: (step, data) => {
    console.log(`📝 ${step}:`, data);
  },

  logValidation: (item, validations) => {
    console.group('✓ Validation Results:');
    Object.entries(validations).forEach(([key, valid]) => {
      console.log(`${valid ? '✅' : '❌'} ${key}:`, item[key]);
    });
    console.groupEnd();
  },

  logError: (error, context = '') => {
    console.group('❌ ERROR');
    console.error(`Context: ${context}`);
    console.error('Error:', error);
    console.trace('Stack trace:');
    console.groupEnd();
  }
};

export const validateMenuItem = (item) => {
  const validations = {
    name: Boolean(item?.name?.trim()),
    price: !isNaN(Number(item?.price)) && Number(item?.price) > 0,
    description: Boolean(item?.description?.trim()),
    category: Boolean(item?.category?.trim())
  };

  TestLogger.logValidation(item, validations);
  return Object.values(validations).every(v => v);
};

export const validateCartItem = (item) => {
  const validations = {
    name: Boolean(item?.item?.name?.trim()),
    price: !isNaN(Number(item?.item?.price)) && Number(item?.item?.price) > 0,
    quantity: !isNaN(Number(item?.quantity)) && Number(item?.quantity) > 0,
    subtotal: Number(item?.item?.price) * Number(item?.quantity) > 0
  };

  TestLogger.logValidation(item, validations);
  return Object.values(validations).every(v => v);
};
