import Remedy from '../models/Remedy.js';

export const listRemedies = (filter = {}) =>
  Remedy.find(filter).sort({ createdAt: -1 });

export const createRemedy = (data) => Remedy.create(data);
