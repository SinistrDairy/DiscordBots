export const requiredString = (indexed = false) => ({
  type: String,
  required: true,
  ...(indexed ? { index: true } : {}),
});

export const optionalString = (indexed = false) => ({
  type: String,
  ...(indexed ? { index: true } : {}),
});

export const boolDefault = (value: boolean) => ({
  type: Boolean,
  default: value,
});

export const dateField = () => ({
  type: Date,
});

export const numberDefault = (value: number) => ({
  type: Number,
  default: value,
});

