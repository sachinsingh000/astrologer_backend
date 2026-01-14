import Astrologer from "../models/Astrologer.js";

export const createAstrologer = async (data) => {
  const astrologer = new Astrologer(data);
  return await astrologer.save();
};

export const getAllAstrologers = async () => {
  return await Astrologer.find();
};

export const getAstrologerById = async (id) => {
  return await Astrologer.findOne({ customId: id });
};
