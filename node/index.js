const { PreAlgoMethods } = require('./Algorithm.js');

async function calculateSchedule(User, algorithm) {
  const Algo = new PreAlgoMethods(User, algorithm);
  // Try with IIFE async constructor function later
  await Algo.init();

  createExamEvents(Algo.Courses, Algo.events, Algo.StartStudyTime, Algo.EndStudyTime, Algo.preparation);

  const AlgorithmStrategy = getAlgorithmStrategy(Algo.algorithm);

  Algo.schedule.Timeblocks = AlgorithmStrategy(Algo.params());

  Algo.schedule.Timeblocks = Algo.schedule.Timeblocks.concat(Algo.events);

  return Algo.schedule;
}

module.exports.calculateSchedule = calculateSchedule;