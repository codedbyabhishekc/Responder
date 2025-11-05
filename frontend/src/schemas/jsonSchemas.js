export const AnyJsonSchema = { type: ['object','array','string','number','boolean','null'] };
export const HeadersSchema = {
  type: 'object',
  additionalProperties: { type: 'string' }
};
