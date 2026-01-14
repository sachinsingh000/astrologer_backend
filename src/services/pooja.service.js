import Pooja from '../models/Pooja.js';

export const listPoojas = () => Pooja.find().sort({ createdAt: -1 });
export const createPooja = (data) => Pooja.create(data);
