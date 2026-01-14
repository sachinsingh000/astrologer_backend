export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(
    { body: req.body, params: req.params, query: req.query },
    { allowUnknown: true, abortEarly: false }
  );
  if (error) return next(error);
  next();
};
