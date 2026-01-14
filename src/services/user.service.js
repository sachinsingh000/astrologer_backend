import User from "../models/User.js";

export const getMe = (id) => User.findById(id);
export const updateMe = (id, data) => User.findByIdAndUpdate(id, data, { new: true });
